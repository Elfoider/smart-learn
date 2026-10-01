import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { buildDemoDocuments } from "./demo-content.mjs";

const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : undefined;
const teacherUid = option("--teacher-uid");
const studentUids = [...new Set((option("--student-uids") || "").split(",").filter(Boolean))];
const projectId = option("--project") || process.env.FIREBASE_PROJECT_ID;
const baseUrl = (option("--base-url") || "https://smart-learn--smart-savings-4be47.us-east4.hosted.app").replace(/\/$/, "");
if (!teacherUid || !studentUids.length || !projectId || !/^https?:\/\//.test(baseUrl)) {
  console.error("Uso: npm run demo:preview -- --project smart-savings-4be47 --teacher-uid UID_DOCENTE --student-uids UID_ESTUDIANTE[,UID_2] [--with-progress]");
  process.exit(1);
}
if (studentUids.includes(teacherUid) || studentUids.length > 20 || [teacherUid, ...studentUids].some(uid => !/^[a-zA-Z0-9_-]{1,128}$/.test(uid))) throw new Error("UIDs inválidos o roles mezclados.");
const withProgress = args.includes("--with-progress");
let students = studentUids.map(uid => ({ uid, name: "Estudiante de demostración", email: "" }));
const preview = buildDemoDocuments({ teacherUid, students, baseUrl, withProgress });
const count = collection => preview.filter(doc => doc.path.startsWith(`${collection}/`)).length;
console.log(`Base: smart-learn-db. Contenido: ${count("courses")} materias, ${count("lessonPlans")} clases, ${count("materials")} guías, ${count("onlineClasses")} encuentros y ${count("assessments")} actividades.`);
console.log(`Documentos previstos: ${preview.length}. Los documentos existentes se conservarán.`);
if (!args.includes("--apply")) {
  console.log("Vista previa: no se hizo ninguna conexión ni escritura en Firebase. Añade --apply para cargar.");
  process.exit(0);
}
let credential;
if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  credential = cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g,"\n") });
} else { credential = applicationDefault(); }
const db = getFirestore(initializeApp({ projectId, credential }), "smart-learn-db");
const profiles = await db.getAll(...[teacherUid,...studentUids].map(uid => db.collection("users").doc(uid)));
for (let index = 0; index < profiles.length; index++) {
  const expected = index ? "student" : "teacher";
  if (!profiles[index].exists || profiles[index].data()?.role !== expected || profiles[index].data()?.status !== "active") throw new Error(`El perfil ${index + 1} debe existir, estar activo y tener rol ${expected}. No se modificó ningún perfil.`);
}
students = profiles.slice(1).map(doc => ({ uid: doc.id, name: doc.data().name || "Estudiante", email: doc.data().email || "" }));
const docs = buildDemoDocuments({ teacherUid, students, baseUrl, withProgress });
// Previene mezclar una carga previa de demostración de otro docente.
const courses = await db.getAll(...docs.filter(d => d.path.startsWith("courses/")).map(d => db.doc(d.path)));
if (courses.some(doc => doc.exists && (doc.data().teacherId !== teacherUid || doc.data().demo !== true))) throw new Error("Los IDs demo-* ya están ocupados por otra carga. Se canceló sin escribir.");
let created = 0, skipped = 0;
for (const doc of docs) {
  const ref = db.doc(doc.path);
  // create usa precondición de inexistencia: nunca sobrescribe datos.
  try { await ref.create(doc.data); created++; }
  catch (error) { if (error.code === 6 || error.code === "already-exists") skipped++; else throw error; }
}
console.log(`Carga finalizada: ${created} nuevos, ${skipped} conservados. Puedes repetirla tras una interrupción.`);
