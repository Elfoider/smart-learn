import { test, after } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";

let env;
async function setup() {
  if (!env) {
    env = await initializeTestEnvironment({
      projectId: "smart-learn-rules-local",
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
