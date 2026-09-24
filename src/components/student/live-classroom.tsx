"use client";

import { useMemo } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import { useStudentEnrollments, useLiveCourse } from "@/components/student/live-courses";
import { CourseTutor } from "@/components/student/course-tutor";

type Resource = { courseId: string; sectionId?: string | null; title: string; url: string; unit?: string; visibleToStudents?: boolean; startsAt?: string };
type Plan = { courseId: string; sectionId?: string | null; title: string; objectives: string[]; contents: string[]; visibleToStudents: boolean };

export function LiveClassroom({ courseId }: { courseId: string }) {
  const { profile } = useAuth();
  const enrolled = useStudentEnrollments();
  const enrollment = enrolled.data.find(e => e.courseId === courseId && e.status === "active");
  const course = useLiveCourse(enrollment ? courseId : "");
  const materialsRef = useMemo(() => profile && enrollment ? query(collection(db, "materials"), where("courseId", "==", courseId), where("sectionId", "==", enrollment.sectionId), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const classesRef = useMemo(() => profile && enrollment ? query(collection(db, "onlineClasses"), where("courseId", "==", courseId), where("sectionId", "==", enrollment.sectionId), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const plansRef = useMemo(() => profile && enrollment ? query(collection(db, "lessonPlans"), where("courseId", "==", courseId), where("sectionId", "==", enrollment.sectionId), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const sharedMaterialsRef = useMemo(() => profile && enrollment ? query(collection(db, "materials"), where("courseId", "==", courseId), where("sectionId", "==", null), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const sharedClassesRef = useMemo(() => profile && enrollment ? query(collection(db, "onlineClasses"), where("courseId", "==", courseId), where("sectionId", "==", null), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const sharedPlansRef = useMemo(() => profile && enrollment ? query(collection(db, "lessonPlans"), where("courseId", "==", courseId), where("sectionId", "==", null), where("visibleToStudents", "==", true)) : null, [profile, enrollment, courseId]);
  const materials = useLiveQuery<Resource>(materialsRef);
  const classes = useLiveQuery<Resource>(classesRef);
  const plans = useLiveQuery<Plan>(plansRef);
  const sharedMaterials = useLiveQuery<Resource>(sharedMaterialsRef);
  const sharedClasses = useLiveQuery<Resource>(sharedClassesRef);
  const sharedPlans = useLiveQuery<Plan>(sharedPlansRef);
  if (enrolled.loading || course.loading) return <p>Cargando salón…</p>;
  if (!enrollment) return <div role="alert" className="rounded-2xl border p-6">No tienes una inscripción activa en esta materia. <Link className="underline" href="/student/courses">Mis materias</Link></div>;
  const subject = course.data[0];
  if (!subject) return <p role="alert">La materia no está disponible.</p>;
  const inSection = (item: { sectionId?: string | null }) => !item.sectionId || item.sectionId === enrollment.sectionId;
  const validUrl = (url: string) => { try { return ["https:", "http:"].includes(new URL(url).protocol); } catch { return false; } };
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><Link href="/student/courses" className="text-sm text-teal-300">← Mis materias</Link><h1 className="mt-3 text-3xl font-semibold">{subject.name}</h1><p className="mt-2 text-white/70">{subject.code} · {subject.description}</p></header>
    {([materials, classes, plans, sharedMaterials, sharedClasses, sharedPlans].some(s => s.error)) && <p role="alert">No se pudieron cargar algunos contenidos. Revisa las reglas publicadas.</p>}
    <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Planificaciones publicadas</h2><div className="mt-4 grid gap-3">{[...plans.data, ...sharedPlans.data].filter(inSection).map(p => <article key={p.id} className="rounded-xl border p-4"><strong>{p.title}</strong><p className="mt-2 text-sm">{p.objectives?.join(" · ")}</p><p className="mt-2 text-sm text-muted-foreground">{p.contents?.join(" · ")}</p></article>)}</div>{!plans.data.length && !sharedPlans.data.length && <p className="mt-3 text-sm">Aún no hay planes publicados.</p>}</section>
    <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Materiales</h2><div className="mt-4 grid gap-3">{[...materials.data, ...sharedMaterials.data].filter(inSection).filter(m => validUrl(m.url)).map(m => <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border p-4 underline">{m.title} {m.unit && `· ${m.unit}`}</a>)}</div>{!materials.data.length && !sharedMaterials.data.length && <p className="mt-3 text-sm">Aún no hay materiales publicados.</p>}</section>
    <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Clases en línea</h2><div className="mt-4 grid gap-3">{[...classes.data, ...sharedClasses.data].filter(inSection).filter(c => validUrl(c.url)).map(c => <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border p-4 underline">{c.title} {c.startsAt && `· ${c.startsAt}`}</a>)}</div>{!classes.data.length && !sharedClasses.data.length && <p className="mt-3 text-sm">Aún no hay clases publicadas.</p>}</section>
    <CourseTutor courseId={courseId} />
  </div>;
}
