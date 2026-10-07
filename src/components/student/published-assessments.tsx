"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMinuteClock } from "@/hooks/use-minute-clock";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useStudentEnrollments, useLiveCourse, type Enrollment } from "@/components/student/live-courses";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import type { TeacherAssessment } from "@/types/teacher-assessment";

export function PublishedAssessments() {
  const enrollments = useStudentEnrollments();
  const active = enrollments.data.filter(item => item.status === "active");
  return <section className="space-y-5">
    <header><h1 className="text-3xl font-semibold">Mis evaluaciones</h1><p className="mt-2 text-muted-foreground">Actividades, instrucciones y rúbricas publicadas para tus materias.</p></header>
    {enrollments.loading && <p role="status">Cargando inscripciones…</p>}
    {enrollments.error && <p role="alert">{enrollments.error}</p>}
    {!enrollments.loading && !enrollments.error && !active.length && <p>Aún no tienes materias inscritas.</p>}
    {active.map(enrollment => <CourseAssessments key={enrollment.id} enrollment={enrollment} />)}
  </section>;
}

function CourseAssessments({ enrollment }: { enrollment: Enrollment }) {
  const now = useMinuteClock();
  const course = useLiveCourse(enrollment.courseId);
  const sectionRef = useMemo(() => query(collection(db, "assessments"), where("courseId", "==", enrollment.courseId), where("sectionId", "==", enrollment.sectionId), where("visibleToStudents", "==", true)), [enrollment.courseId, enrollment.sectionId]);
  const sharedRef = useMemo(() => query(collection(db, "assessments"), where("courseId", "==", enrollment.courseId), where("sectionId", "==", null), where("visibleToStudents", "==", true)), [enrollment.courseId]);
  const section = useLiveQuery<TeacherAssessment>(sectionRef);
  const shared = useLiveQuery<TeacherAssessment>(sharedRef);
  const assessments = [...new Map([...section.data, ...shared.data].map(item => [item.id, item])).values()].sort((a,b) => (a.closesAt || "").localeCompare(b.closesAt || ""));
  const statuses: Record<string,string> = { draft: "Borrador publicado", scheduled: "Programada", open: "Abierta", closed: "Cerrada", graded: "Calificada", archived: "Archivada" };
  return <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
    <h2 className="text-xl font-semibold">{course.data[0]?.name || "Materia inscrita"}</h2>
    {(section.loading || shared.loading) && <p role="status" className="mt-3">Cargando evaluaciones…</p>}
    {(section.error || shared.error) && <p role="alert" className="mt-3 text-red-500">No se pudieron cargar las evaluaciones. Recarga para reintentar.</p>}
    {!section.loading && !shared.loading && !section.error && !shared.error && !assessments.length && <p className="mt-3 text-muted-foreground">Tu docente aún no ha publicado evaluaciones para esta sección.</p>}
    <div className="mt-4 space-y-4">{assessments.map(item => <article key={item.id} className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs font-semibold text-primary">{item.status === "open" && item.closesAt && new Date(item.closesAt).getTime() < now ? "Plazo finalizado" : statuses[item.status] || "Publicada"} · {item.maxScore} puntos · Ponderación {item.weightPercentage}%</p>
      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{item.description}</p>
      <p className="mt-3 text-sm text-muted-foreground">Apertura: {item.opensAt?.replace("T", " ") || "Por confirmar"} · Cierre: {item.closesAt?.replace("T", " ") || "Por confirmar"}</p>
      <h4 className="mt-4 font-semibold">Instrucciones</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7">{item.instructions || "Consulta las indicaciones con tu docente."}</p>
      {item.rubric?.length > 0 && <div className="mt-4"><h4 className="font-semibold">Rúbrica de evaluación</h4><ul className="mt-2 space-y-2">{item.rubric.map(criterion => <li key={criterion.id} className="rounded-xl bg-muted/50 p-3 text-sm"><strong>{criterion.title} · {criterion.points} puntos</strong><p className="mt-1">{criterion.description}</p></li>)}</ul></div>}
      <p className="mt-4 text-sm text-muted-foreground">{item.deliveryMode === "manual" ? "Entrega según las indicaciones del docente; la calificación se registra después de su revisión." : "Consulta con tu docente el enlace y las instrucciones de entrega. Esta actividad no tiene un cuestionario conectado en el prototipo."}</p>
      <Link className="mt-4 inline-block text-sm font-semibold text-primary underline" href={`/student/courses/${encodeURIComponent(enrollment.courseId)}`}>Estudiar esta materia</Link>
    </article>)}</div>
  </section>;
}
