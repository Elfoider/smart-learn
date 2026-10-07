import { getAdminDb } from "@/lib/firebase/admin";
import { StudentApiError } from "@/lib/server/student-api-auth";

export async function getPublishedLessons(userId: string, courseId: string) {
  const db = getAdminDb();
  const enrollment = await db.collection("enrollments").doc(`${courseId}--${userId}`).get();
  if (!enrollment.exists || enrollment.data()?.status !== "active") throw new StudentApiError("No tienes acceso a esta materia.", 403);
  const course = await db.collection("courses").doc(courseId).get();
  if (!course.exists) throw new StudentApiError("Materia no encontrada.", 404);
  const snapshot = await db.collection("lessonPlans").where("teacherId", "==", course.data()?.teacherId).get();
  const lessons = snapshot.docs.filter(doc => {
    const p = doc.data();
    return p.courseId === courseId && p.visibleToStudents === true && (!p.sectionId || p.sectionId === enrollment.data()?.sectionId);
  }).map(doc => {
    const p = doc.data();
    const strings = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, 4).map(text => text.slice(0, 400)) : [];
    return { id: doc.id, title: String(p.title || "Clase"), unit: String(p.unit || "Unidad"),
      startDate: String(p.startDate || ""), objectives: strings(p.objectives), contents: strings(p.contents),
      lessonContent: String(p.lessonContent || "").slice(0, 4000) };
  }).sort((a,b) => a.unit.localeCompare(b.unit, "es", { numeric: true }) || a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
  return { course, enrollment, lessons };
}
