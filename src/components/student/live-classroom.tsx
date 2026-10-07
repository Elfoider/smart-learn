"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import { useStudentEnrollments, useLiveCourse } from "@/components/student/live-courses";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { LessonNotes } from "@/components/learning/lesson-notes";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { CourseTutor } from "@/components/student/course-tutor";

type Resource = { courseId: string; sectionId?: string | null; title: string; url: string; unit?: string; visibleToStudents?: boolean; startsAt?: string };
const noCompleted: string[] = [];
type Plan = { unit?: string; startDate?: string; lessonContent?: string; activities?: string[]; estimatedMinutes?: number; courseId: string; sectionId?: string | null; title: string; objectives: string[]; contents: string[]; visibleToStudents: boolean };

export function LiveClassroom({ courseId }: { courseId: string }) {
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const progress = useCourseProgress({ courseId, initialCurrentLessonId: "", initialCompletedLessonIds: noCompleted });
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
  if (enrolled.loading || course.loading || progress.loading) return <p>Cargando salón…</p>;
  if (!enrollment) return <div role="alert" className="rounded-2xl border p-6">No tienes una inscripción activa en esta materia. <Link className="underline" href="/student/courses">Mis materias</Link></div>;
  const subject = course.data[0];
  if (!subject) return <p role="alert">La materia no está disponible.</p>;
  const inSection = (item: { sectionId?: string | null }) => !item.sectionId || item.sectionId === enrollment.sectionId;
  const validUrl = (url: string) => { try { return ["https:", "http:"].includes(new URL(url).protocol); } catch { return false; } };
  const ordered = [...new Map([...plans.data, ...sharedPlans.data].map(item => [item.id, item])).values()].filter(inSection)
    .sort((a,b) => (a.unit || "").localeCompare(b.unit || "", "es", { numeric: true }) || (a.startDate || "").localeCompare(b.startDate || "") || a.title.localeCompare(b.title));
  const selected = ordered.find(p => p.id === progress.currentLessonId) || ordered[0];
  const groups = [...new Set(ordered.map(p => p.unit || "Contenido"))];
  const completed = ordered.filter(p => progress.completedLessonIds.includes(p.id)).length;
  const percent = ordered.length ? Math.round(completed / ordered.length * 100) : 0;
  const sections = selected ? [
    { title: "Lo que aprenderás", paragraphs: selected.objectives || [] },
    { title: "Conceptos de la clase", paragraphs: selected.contents || [] },
    { title: "Explicación y ejemplos", paragraphs: selected.lessonContent ? selected.lessonContent.split(/\n\n+/).filter(Boolean) : ["Consulta los conceptos y materiales de apoyo publicados por tu docente."] },
    { title: "Ponlo en práctica", paragraphs: selected.activities?.length ? selected.activities : ["Explica el concepto con tus propias palabras y practica con un nuevo ejercicio."] },
  ] : [];
  const allLoading = [plans, sharedPlans, materials, sharedMaterials, classes, sharedClasses].some(s => s.loading);
  const allError = [plans, sharedPlans, materials, sharedMaterials, classes, sharedClasses].some(s => s.error);
  return <div className="space-y-6">
    <header className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-7 md:p-9"><Link href="/student/courses" className="text-sm text-primary">← Mis materias</Link><p className="mt-5 text-xs font-semibold uppercase tracking-widest text-primary">{subject.code} · Salón virtual</p><h1 className="mt-2 text-3xl font-semibold">{subject.name}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{subject.description}</p><p className="mt-5 text-sm">{completed} de {ordered.length} clases completadas · {percent}%</p><progress className="mt-2 h-2 w-full accent-teal-500" max={100} value={percent} aria-label="Progreso de la materia" /></header>
    {allError && <p role="alert" className="rounded-xl border border-red-500/30 p-4">No se pudieron cargar algunos contenidos. Vuelve a intentarlo.</p>}
    {allLoading && <p role="status">Cargando las clases publicadas…</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-3xl border border-border bg-card p-5 xl:sticky xl:top-24"><h2 className="flex items-center gap-2 font-semibold"><BookOpen size={18} className="text-primary" /> Unidades y capítulos</h2>
        {!ordered.length && !allLoading && <p className="mt-4 text-sm text-muted-foreground">Tu docente aún no ha publicado clases.</p>}
        {groups.map(unit => <div key={unit} className="mt-5"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{unit}</h3><div className="space-y-2">{ordered.filter(p => (p.unit || "Contenido") === unit).map(p => <button type="button" key={p.id} aria-current={selected?.id === p.id ? "step" : undefined} onClick={() => { setStep(0); void progress.openLesson(p.id); }} className="flex w-full items-start gap-2 rounded-xl border border-border p-3 text-left text-sm aria-[current=step]:border-primary aria-[current=step]:bg-primary/10">{progress.completedLessonIds.includes(p.id) && <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />}<span>{p.title}</span></button>)}</div></div>)}
      </aside>
      <main className="min-w-0 space-y-6">
        {selected && <>
          <article className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border p-6"><p className="text-xs font-semibold text-primary">{selected.unit} · {selected.estimatedMinutes || 30} minutos</p><h2 className="mt-2 text-2xl font-semibold">{selected.title}</h2></div>
            <nav aria-label="Secciones de la clase" className="flex flex-wrap gap-2 border-b border-border p-4">{sections.map((section,index) => <button key={section.title} type="button" aria-pressed={step === index} className="rounded-full border border-border px-3 py-2 text-xs aria-pressed:bg-primary aria-pressed:text-primary-foreground" onClick={() => setStep(index)}>{index + 1}. {section.title}</button>)}</nav>
            <div className="min-h-72 p-6 md:p-9"><p className="text-xs uppercase tracking-widest text-muted-foreground">Sección {step + 1} de {sections.length}</p><h3 className="mt-3 text-xl font-semibold">{sections[step].title}</h3><div className="mt-6 space-y-5">{sections[step].paragraphs.map((text,index) => <p key={index} className="whitespace-pre-wrap leading-8">{text}</p>)}</div></div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5"><button type="button" disabled={step === 0} onClick={() => setStep(v => v - 1)} className="flex items-center gap-1 text-sm disabled:opacity-30"><ChevronLeft size={17} />Anterior</button><button type="button" disabled={step === 3} onClick={() => setStep(v => v + 1)} className="flex items-center gap-1 text-sm disabled:opacity-30">Siguiente<ChevronRight size={17} /></button></div>
          </article>
          <div className="flex flex-wrap gap-3"><button type="button" disabled={progress.saving || progress.loading} onClick={() => void progress.toggleLessonCompleted(selected.id)} className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold">{progress.completedLessonIds.includes(selected.id) ? "Marcar como pendiente" : "Marcar clase completada"}</button><Link href={`/student/playground?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(selected.id)}`} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><Sparkles size={17} />Practicar esta clase</Link></div>
          <LessonNotes key={selected.id} courseId={courseId} lessonId={selected.id} />
          <CourseTutor key={`tutor-${selected.id}`} courseId={courseId} lessonId={selected.id} />
        </>}
        <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Biblioteca de apoyo</h2><div className="mt-4 grid gap-3">{[...materials.data, ...sharedMaterials.data].filter(inSection).filter(m => validUrl(m.url)).map(m => <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border p-4 text-sm hover:border-primary">{m.title} {m.unit && `· ${m.unit}`} ↗</a>)}</div>{!materials.data.length && !sharedMaterials.data.length && <p className="mt-3 text-sm text-muted-foreground">Aún no hay materiales publicados.</p>}</section>
        <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Encuentros en línea</h2><div className="mt-4 grid gap-3">{[...classes.data, ...sharedClasses.data].filter(inSection).filter(c => validUrl(c.url)).map(c => <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-border p-4 text-sm hover:border-primary">{c.title} {c.startsAt && `· ${c.startsAt.replace("T", " ")}`} ↗</a>)}</div>{!classes.data.length && !sharedClasses.data.length && <p className="mt-3 text-sm text-muted-foreground">Aún no hay encuentros programados.</p>}</section>
      </main>
    </div>
  </div>;
}
