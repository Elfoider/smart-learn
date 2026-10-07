import { test, after } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

let env;
async function setup() {
  if (!env) {
    env = await initializeTestEnvironment({
      projectId: "demo-smart-learn",
      firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
    });
    await env.withSecurityRulesDisabled(async context => {
      const db = context.firestore();
      await db.doc("users/teacher1").set({ role: "teacher", status: "active" });
      await db.doc("users/student1").set({ role: "student", status: "active" });
      await db.doc("users/student2").set({ role: "student", status: "active" });
      await db.doc("courses/course1").set({ teacherId: "teacher1", name: "Pruebas" });
      await db.doc("enrollments/course1--student1").set({ courseId: "course1", studentId: "student1", sectionId: "section1", status: "active", teacherId: "teacher1" });
      await db.doc("materials/material1").set({ teacherId: "teacher1", courseId: "course1", sectionId: "section1", visibleToStudents: true, title: "Guía" });
      await db.doc("materials/private").set({ teacherId: "teacher1", courseId: "course1", sectionId: "section2", visibleToStudents: false, title: "Privado" });
      await db.doc("grades/grade1").set({ teacherId: "teacher1", courseId: "course1", studentId: "student1", status: "draft" });
    });
  }
  return env;
}
after(async () => { if (env) await env.cleanup(); });

test("student can read enrolled course and visible section resource", async () => {
  const e = await setup(); const db = e.authenticatedContext("student1").firestore();
  await assertSucceeds(db.doc("courses/course1").get());
  await assertSucceeds(db.doc("materials/material1").get());
  await assertFails(db.doc("materials/private").get());
  await assertFails(db.doc("grades/grade1").get());
});
test("other student cannot read course, material or grade", async () => {
  const e = await setup(); const db = e.authenticatedContext("student2").firestore();
  await assertFails(db.doc("courses/course1").get());
  await assertFails(db.doc("materials/material1").get());
  await assertFails(db.doc("grades/grade1").get());
});
test("student cannot grant roles, enroll themselves or write grades", async () => {
  const e = await setup(); const db = e.authenticatedContext("student1").firestore();
  await assertFails(db.doc("users/student1").update({ role: "admin" }));
  await assertFails(db.doc("enrollments/course1--student2").set({ studentId: "student2" }));
  await assertFails(db.doc("grades/grade1").update({ status: "published" }));
});
test("teacher may publish own material but cannot take over another course", async () => {
  const e = await setup(); const db = e.authenticatedContext("teacher1").firestore();
  await assertSucceeds(db.collection("materials").add({ teacherId: "teacher1", courseId: "course1", sectionId: null, visibleToStudents: true, title: "Recurso" }));
  await assertFails(db.doc("courses/course1").update({ teacherId: "student1" }));
});
test("unauthenticated users cannot access records", async () => {
  const e = await setup(); const db = e.unauthenticatedContext().firestore();
  await assertFails(db.doc("courses/course1").get());
});

test("active exam answers persist, but score, start time and attempt identity cannot change", async () => {
  const e = await setup();
  await e.withSecurityRulesDisabled(async context => {
    await context.firestore().doc('users/student1/examAttempts/active').set({ status:'active', userId:'student1', examId:'demo', startedAt:new Date(), startedAtMs:Date.now(), durationSeconds:600, remainingSeconds:600, answers:{}, flaggedQuestionIds:[], currentQuestionIndex:0, result:null });
  });
  const db=e.authenticatedContext('student1').firestore();const attempt=db.doc('users/student1/examAttempts/active');
  await assertSucceeds(attempt.update({ answers:{q1:'a'},remainingSeconds:590 }));
  await assertFails(attempt.update({ result:{score:100} }));
  await assertFails(attempt.update({ startedAt:new Date() }));
  await assertFails(attempt.update({ status:'submitted' }));
  await assertFails(attempt.update({ remainingSeconds:999999 }));
  await assertFails(attempt.update({ remainingSeconds:-1 }));
  await assertFails(e.authenticatedContext('student2').firestore().doc('users/student1/examAttempts/active').get());
});
test("expired or submitted exams reject new answers", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context => {
    const db=context.firestore();
    const data={status:'active',durationSeconds:1,startedAt:new Date(Date.now()-10000),remainingSeconds:0,answers:{},flaggedQuestionIds:[],currentQuestionIndex:0};
    await db.doc('users/student1/examAttempts/expired').set(data);
    await db.doc('users/student1/examAttempts/submitted').set({...data,status:'submitted'});
  });
  const db=e.authenticatedContext('student1').firestore();
  await assertFails(db.doc('users/student1/examAttempts/expired').update({answers:{q1:'a'}}));
  await assertFails(db.doc('users/student1/examAttempts/submitted').update({answers:{q1:'a'}}));
});
test("real practice counters and private solutions are server-only", async () => {
  const e=await setup();const db=e.authenticatedContext('student1').firestore();
  await assertFails(db.doc('users/student1/playgroundSessions/course1--real').set({attempts:99,correctAnswers:99}));
  await assertFails(db.doc('users/student1/practiceChallenges/secret').get());
  await assertFails(db.doc('users/student1/practiceChallenges/secret').set({correctIndex:0}));
  await assertFails(db.doc('users/student1/aiUsage/today').set({count:0}));
  await assertSucceeds(db.doc('users/student1/playgroundSessions/demo--topic').set({attempts:1,correctAnswers:1}));
});
test("student may read shared published assessment and rubric, never drafts or another section", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context => {
    const db=context.firestore();const data={teacherId:'teacher1',courseId:'course1',sectionId:null,visibleToStudents:true,rubric:[{title:'Comprensión',points:10}]};
    await db.doc('assessments/shared').set(data);
    await db.doc('assessments/hidden').set({...data,visibleToStudents:false});
    await db.doc('assessments/other-section').set({...data,sectionId:'section2'});
  });
  const db=e.authenticatedContext('student1').firestore();
  await assertSucceeds(db.doc('assessments/shared').get());
  await assertFails(db.doc('assessments/hidden').get());
  await assertFails(db.doc('assessments/other-section').get());
  await assertSucceeds(db.collection('assessments').where('courseId','==','course1').where('sectionId','==',null).where('visibleToStudents','==',true).get());
});
test("teacher cannot attach another course's section or change resource owner/course", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context => {
    const db=context.firestore();
    await db.doc('courses/course2').set({teacherId:'teacher2'});
    await db.doc('sections/section1').set({teacherId:'teacher1',courseId:'course1'});
    await db.doc('sections/section2').set({teacherId:'teacher2',courseId:'course2'});
  });
  const db=e.authenticatedContext('teacher1').firestore();
  await assertFails(db.doc('materials/material1').update({sectionId:'section2'}));
  await assertFails(db.doc('materials/material1').update({courseId:'course2'}));
  await assertFails(db.doc('materials/material1').update({teacherId:'teacher2'}));
  await assertFails(db.collection('materials').add({teacherId:'teacher1',courseId:'course1',sectionId:'section2',visibleToStudents:true}));
  await assertSucceeds(db.doc('materials/material1').update({title:'Guía revisada'}));
});
test("grades require matching course, section, enrollment and assessment", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context => {
    const db=context.firestore();
    await db.doc('sections/section1').set({teacherId:'teacher1',courseId:'course1'});
    await db.doc('assessments/assessment1').set({teacherId:'teacher1',courseId:'course1',sectionId:'section1',visibleToStudents:true});
    await db.doc('assessments/foreign').set({teacherId:'teacher2',courseId:'course2',sectionId:'section2',visibleToStudents:true});
  });
  const db=e.authenticatedContext('teacher1').firestore();
  const data={teacherId:'teacher1',courseId:'course1',sectionId:'section1',studentId:'student1',enrollmentId:'course1--student1',assessmentId:'assessment1',score:17,maxScore:20,status:'published'};
  await assertSucceeds(db.doc('grades/valid').set(data));
  await assertFails(db.doc('grades/mismatch').set({...data,assessmentId:'foreign'}));
  await assertFails(db.doc('grades/mismatch').set({...data,enrollmentId:'course2--student1'}));
  await assertFails(db.doc('grades/mismatch').set({...data,studentId:'student2'}));
  await assertFails(db.doc('grades/valid').update({score:21}));
  await assertSucceeds(e.authenticatedContext('student1').firestore().doc('grades/valid').get());
});
test("suspended profiles cannot read grades, attendance or enrollments", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context => {
    const db=context.firestore();
    await db.doc('users/suspended').set({role:'student',status:'suspended'});
    await db.doc('grades/suspended').set({studentId:'suspended',teacherId:'teacher1',status:'published'});
    await db.doc('attendance/suspended').set({studentId:'suspended',teacherId:'teacher1'});
    await db.doc('enrollments/suspended').set({studentId:'suspended',teacherId:'teacher1'});
  });
  const db=e.authenticatedContext('suspended').firestore();
  for (const path of ['grades/suspended','attendance/suspended','enrollments/suspended']) await assertFails(db.doc(path).get());
});
test("new OAuth profile can only create an active student matching its identity", async () => {
  const e=await setup();const db=e.authenticatedContext('newstudent',{email:'new@example.test'}).firestore();
  const data={uid:'newstudent',name:'Nuevo',email:'new@example.test',role:'student',status:'active'};
  await assertFails(db.doc('users/newstudent').set({...data,role:'admin'}));
  await assertFails(db.doc('users/newstudent').set({...data,email:'other@example.test'}));
  await assertSucceeds(db.doc('users/newstudent').set(data));
});

test("admin reads academic records but cannot bypass audited server mutations", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context=>{
    const db=context.firestore();
    await db.doc('users/admin1').set({role:'admin',status:'active'});
    await db.doc('adminAudit/entry').set({actorId:'admin1',reason:'Cambio de prueba'});
    await db.doc('systemSettings/general').set({institutionName:'Universidad',dailyAiLimit:50});
    await db.doc('lessonPlans/admin-view').set({teacherId:'teacher1',courseId:'course1',sectionId:null,visibleToStudents:false});
    await db.doc('attendance/admin-view').set({teacherId:'teacher1',studentId:'student1',courseId:'course1'});
  });
  const db=e.authenticatedContext('admin1').firestore();
  for(const name of ['users','courses','sections','enrollments','lessonPlans','materials','assessments','grades','attendance','onlineClasses','adminAudit','aiLogs'])await assertSucceeds(db.collection(name).get());
  await assertSucceeds(db.doc('systemSettings/general').get());
  for(const [path,patch]of [['users/student1',{role:'admin'}],['courses/course1',{teacherId:'admin1'}],['materials/material1',{title:'Sin auditar'}],['systemSettings/general',{dailyAiLimit:200}],['adminAudit/entry',{reason:'Alterado'}]])await assertFails(db.doc(path).update(patch));
  await assertFails(db.doc('users/student1').delete());
});
test("academic users read general settings but never administrative audit/control", async () => {
  const e=await setup();
  for(const uid of ['student1','teacher1']) {
    const db=e.authenticatedContext(uid).firestore();
    await assertSucceeds(db.doc('systemSettings/general').get());
    await assertFails(db.doc('adminAudit/entry').get());
    await assertFails(db.doc('adminControl/writes').get());
    await assertFails(db.doc('systemSettings/private').get());
    await assertFails(db.doc('systemSettings/general').update({announcement:'Texto no autorizado'}));
  }
  await assertFails(e.unauthenticatedContext().firestore().doc('systemSettings/general').get());
});
test("suspended administrator loses global reads and administrative audit access", async () => {
  const e=await setup();
  await e.withSecurityRulesDisabled(async context=>{await context.firestore().doc('users/admin-suspended').set({role:'admin',status:'suspended'});});
  const db=e.authenticatedContext('admin-suspended').firestore();
  for(const name of ['users','courses','materials','grades','adminAudit','aiLogs'])await assertFails(db.collection(name).get());
  await assertFails(db.doc('systemSettings/general').get());
});
