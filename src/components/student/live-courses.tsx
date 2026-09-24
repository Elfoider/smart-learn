"use client";

import { useMemo } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";

export type Enrollment = { courseId: string; sectionId: string; studentId: string; status: string };
export type Course = { name: string; code: string; description: string; teacherId: string; status: string };
export function useStudentEnrollments() {
  const { profile } = useAuth();
  const ref = useMemo(() => profile ? query(collection(db, "enrollments"), where("studentId", "==", profile.uid)) : null, [profile]);
  return useLiveQuery<Enrollment>(ref);
}
export function LiveCourses() {
  const enrollment = useStudentEnrollments();
  const ids = enrollment.data.filter(e => e.status === "active").map(e => e.courseId);
  return <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
    <div><p className="text-sm font-semibold text-teal-600">Firestore · smart-learn-db</p><h2 className="mt-1 text-2xl font-semibold">Mis materias inscritas</h2></div>
    {enrollment.loading && <p>Cargando inscripciones…</p>}{enrollment.error && <p role="alert">{enrollment.error}</p>}
    {!enrollment.loading && !ids.length && <p>Aún no tienes materias inscritas. Pide a tu docente que te inscriba.</p>}
    <div className="grid gap-3 md:grid-cols-2">{ids.map(id => <LiveCourseCard key={id} id={id} />)}</div>
  </section>;
}
function LiveCourseCard({ id }: { id: string }) {
  const { data, loading, error } = useLiveCourse(id);
  const course = data[0];
  if (loading) return <p>Cargando materia…</p>;
  if (error || !course) return <p role="alert">No se pudo cargar la materia {id}.</p>;
  return <Link className="rounded-2xl border border-border bg-background p-5 transition hover:border-teal-500" href={`/student/courses/${id}`}>
    <p className="text-sm text-teal-600">{course.code}</p><h3 className="mt-1 text-lg font-semibold">{course.name}</h3><p className="mt-2 text-sm text-muted-foreground">{course.description}</p><p className="mt-4 text-sm font-semibold">Entrar al salón →</p>
  </Link>;
}
export function useLiveCourse(id: string) {
  const { profile } = useAuth();
  const ref = useMemo(() => profile && id ? query(collection(db, "courses"), where("__name__", "==", id)) : null, [id, profile]);
  return useLiveQuery<Course>(ref);
}
