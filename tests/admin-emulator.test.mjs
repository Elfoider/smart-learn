import test from 'node:test';
import assert from 'node:assert/strict';
import './register-paths.mjs';
if(!/^127\.0\.0\.1:\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST||''))throw Error('Estas pruebas requieren Firestore Emulator local. Nunca se ejecutan contra producción.');
process.env.FIREBASE_PROJECT_ID='demo-smart-learn';delete process.env.FIREBASE_CLIENT_EMAIL;delete process.env.FIREBASE_PRIVATE_KEY;
const {getAdminDb}=await import('../src/lib/firebase/admin.ts');
const {adminSave,adminList}=await import('../src/lib/server/admin-service.ts');
const {consumeAiUsage}=await import('../src/lib/server/ai-usage.ts');
const db=getAdminDb(),admin='integration-admin',teacher='integration-teacher',nextTeacher='integration-next',student='integration-student';
const reason='Validación de transacción en el emulador';let courseId,sectionId;
test('Firestore Admin SDK real: crea oferta y matrícula con contadores en smart-learn-db',async()=>{
 for(const [uid,role]of [[admin,'admin'],[teacher,'teacher'],[nextTeacher,'teacher'],[student,'student']])await db.collection('users').doc(uid).set({uid,role,status:'active',name:uid,email:uid+'@example.test'});
 courseId=(await adminSave(admin,'courses',null,{teacherId:teacher,name:'Materia de integración',code:'INT-7',period:'2026',status:'active'},reason)).id;
 sectionId=(await adminSave(admin,'sections',null,{courseId,code:'A1',modality:'online',capacity:1,status:'active'},reason)).id;
 await adminSave(admin,'enrollments',null,{courseId,sectionId,studentId:student,status:'active'},reason);
 const course=(await db.collection('courses').doc(courseId).get()).data();assert.equal(course.sectionsCount,1);assert.equal(course.studentsCount,1);
 assert.equal(db.databaseId,'smart-learn-db');
});
test('Firestore Admin SDK real: transferencia conserva referencias, actualiza responsables y audita',async()=>{
 const lesson=(await adminSave(admin,'lessonPlans',null,{courseId,sectionId,title:'Clase de integración',status:'completed',visibleToStudents:true,lessonContent:'Contenido comprobado'},reason)).id;
 await adminSave(admin,'courses',courseId,{teacherId:nextTeacher,name:'Materia de integración',code:'INT-7',period:'2026',status:'active'},reason);
 for(const [collection,id]of [['courses',courseId],['sections',sectionId],['enrollments',courseId+'--'+student],['lessonPlans',lesson]])assert.equal((await db.collection(collection).doc(id).get()).data().teacherId,nextTeacher);
 const audit=await db.collection('adminAudit').where('recordId','==',courseId).get();assert.ok(audit.docs.some(d=>d.data().before?.teacherId===teacher&&d.data().after?.teacherId===nextTeacher&&d.data().actorId===admin));
 const rows=await adminList('lessonPlans');assert.ok(rows.records.some(r=>r.id===lesson&&typeof r.createdAt==='string'));
});
test('Firestore Admin SDK real: configuración y cupo comparten límite transaccional',async()=>{
 await adminSave(admin,'settings','general',{institutionName:'Institución de prueba',academicPeriod:'2026',dailyAiLimit:1},reason);
 const responses=await Promise.all([consumeAiUsage(student),consumeAiUsage(student)]);
 assert.equal(responses.filter(r=>r.allowed).length,1);
 assert.equal((await db.collection('users').doc(student).collection('aiUsage').doc(new Date().toISOString().slice(0,10)).get()).data().count,1);
});
