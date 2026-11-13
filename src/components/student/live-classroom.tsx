"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import { useStudentEnrollments, useLiveCourse } from "@/components/student/live-courses";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { LessonNotes } from "@/components/learning/lesson-notes";
import { BookOpen, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, List, Sparkles } from "lucide-react";
import { CourseTutor } from "@/components/student/course-tutor";
import { formatAcademicDate, safeMeetingUrl } from "@/lib/student/experience";

type Resource = { courseId: string; sectionId?: string | null; title: string; url: string; unit?: string; visibleToStudents?: boolean; startsAt?: string };
const noCompleted: string[] = [];
type Plan = { unit?: string; startDate?: string; lessonContent?: string; activities?: string[]; estimatedMinutes?: number; courseId: string; sectionId?: string | null; title: string; objectives: string[]; contents: string[]; visibleToStudents: boolean };

const tools = [
  { id: "materials", label: "Materiales" },
  { id: "meetings", label: "Encuentros" },
  { id: "notes", label: "Mis notas" },
  { id: "tutor", label: "Tutor IA" },
] as const;

type ClassroomTool = (typeof tools)[number]["id"];
const lessonUnit = (lesson: Plan) => lesson.unit?.trim() || "Contenido";
const controlClass = "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40";

export function LiveClassroom({ courseId }: { courseId: string }) {
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState<boolean | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [activeTool, setActiveTool] = useState<ClassroomTool | null>(null);
  const lessonHeading = useRef<HTMLHeadingElement>(null);
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
  if (enrolled.error || course.error) return <p role="alert">No se pudo cargar la materia. Actualiza la página para reintentar.</p>;
  if (!enrollment) return <div role="alert" className="rounded-2xl border p-6">No tienes una inscripción activa en esta materia. <Link className="underline" href="/student/courses">Mis materias</Link></div>;
  const subject = course.data[0];
  if (!subject) return <p role="alert">La materia no está disponible.</p>;
  const inSection = (item: { sectionId?: string | null }) => !item.sectionId || item.sectionId === enrollment.sectionId;
  const ordered = [...new Map([...plans.data, ...sharedPlans.data].map(item => [item.id, item])).values()].filter(inSection)
    .sort((a,b) => (a.unit || "").localeCompare(b.unit || "", "es", { numeric: true }) || (a.startDate || "").localeCompare(b.startDate || "") || a.title.localeCompare(b.title));
  const selected = ordered.find(p => p.id === selectedLessonId)
    || ordered.find(p => p.id === progress.currentLessonId && !progress.completedLessonIds.includes(p.id))
    || ordered.find(p => !progress.completedLessonIds.includes(p.id))
    || ordered.find(p => p.id === progress.currentLessonId) || ordered[0];
  const groups = new Map<string, typeof ordered>();
  for (const lesson of ordered) {
    const unit = lessonUnit(lesson);
    const group = groups.get(unit) ?? [];
    group.push(lesson);
    groups.set(unit, group);
  }
  const position = ordered.findIndex(lesson => lesson.id === selected?.id);
  const previousLesson = position > 0 ? ordered[position - 1] : undefined;
  const nextLesson = position >= 0 ? ordered[position + 1] : undefined;
  const resources = (items: (Resource & { id: string })[]) =>
    [...new Map(items.map(item => [item.id, item])).values()]
      .filter(inSection).filter(item => safeMeetingUrl(item.url));
  const publishedMaterials = resources([...materials.data, ...sharedMaterials.data]);
  const publishedMeetings = resources([...classes.data, ...sharedClasses.data]);
  const isCompleted = selected ? progress.completedLessonIds.includes(selected.id) : false;
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
  function openLesson(lesson: (typeof ordered)[number]) {
    setStep(0);
    setSelectedLessonId(lesson.id);
    setExpandedUnits(current => ({ ...current, [lessonUnit(lesson)]: true }));
    if (window.matchMedia("(max-width: 1023px)").matches) setShowIndex(false);
    void progress.openLesson(lesson.id);
    requestAnimationFrame(() => lessonHeading.current?.focus());
  }

  const indexVisible = showIndex === null ? "hidden lg:block" : showIndex ? "block" : "hidden";

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-card p-4 sm:p-5">
        <Link href="/student/courses" className="text-sm font-medium text-primary hover:underline">← Mis materias</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">{subject.code} · Salón virtual</p>
            <h1 className="mt-1 break-words text-2xl font-semibold">{subject.name}</h1>
          </div>
          <div className="w-full max-w-52">
            <p className="text-sm">{completed} de {ordered.length} clases completadas</p>
            <progress className="mt-1 block h-2 w-full accent-primary" max={100} value={percent} aria-label="Progreso de la materia" />
          </div>
        </div>
      </header>

      {allError && <p role="alert" className="rounded-xl border border-red-500/30 p-4">No se pudieron cargar algunos contenidos. Actualiza la página para reintentar.</p>}
      {allLoading && <p role="status" className="text-sm text-muted-foreground">Cargando contenido publicado…</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={controlClass + " lg:hidden"} aria-controls="classroom-index" aria-expanded={showIndex === true} onClick={() => setShowIndex(showIndex !== true)}>
          <List size={17} /> Índice de clases
        </button>
        <button type="button" className={controlClass + " hidden lg:inline-flex"} aria-controls="classroom-index" aria-expanded={showIndex !== false} onClick={() => setShowIndex(showIndex === false)}>
          <List size={17} /> {showIndex === false ? "Mostrar índice" : "Ocultar índice"}
        </button>
      </div>

      <div className={showIndex === false ? "grid gap-4" : "grid items-start gap-4 lg:grid-cols-[minmax(13rem,17rem)_minmax(0,1fr)]"}>
        <aside id="classroom-index" className={`${indexVisible} min-w-0 rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-6 lg:max-h-[75dvh] lg:overflow-y-auto`}>
          <h2 className="flex items-center gap-2 font-semibold"><BookOpen size={18} className="text-primary" /> Unidades y clases</h2>
          {!ordered.length && !allLoading && !allError && <p className="mt-3 text-sm text-muted-foreground">Tu docente aún no ha publicado clases.</p>}
          {[...groups].map(([unit, lessons], unitIndex) => {
            const expanded = (Object.hasOwn(expandedUnits, unit) ? expandedUnits[unit] : undefined) ?? Boolean(selected && lessonUnit(selected) === unit);
            const unitId = `classroom-unit-${unitIndex}`;
            return (
              <div key={unit} className="mt-3 border-t border-border pt-2">
                <button type="button" aria-expanded={expanded} aria-controls={unitId} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-sm font-semibold hover:bg-primary/10" onClick={() => setExpandedUnits(current => ({ ...current, [unit]: !expanded }))}>
                  <span className="break-words">{unit}</span>
                  <ChevronDown size={16} className={expanded ? "shrink-0 rotate-180 motion-safe:transition-transform" : "shrink-0 motion-safe:transition-transform"} />
                </button>
                <ul id={unitId} hidden={!expanded} className="space-y-1">
                  {lessons.map(lesson => (
                    <li key={lesson.id}>
                      <button type="button" aria-current={selected?.id === lesson.id ? "step" : undefined} disabled={progress.saving} onClick={() => openLesson(lesson)} className="flex min-h-11 w-full items-start gap-2 rounded-lg border border-transparent px-2 py-2.5 text-left text-sm hover:bg-primary/5 aria-[current=step]:border-primary/40 aria-[current=step]:bg-primary/10">
                        {progress.completedLessonIds.includes(lesson.id) && <CheckCircle2 size={16} aria-label="Completada" className="mt-0.5 shrink-0 text-primary" />}
                        <span className="min-w-0 break-words">{lesson.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </aside>

        <div className="min-w-0 space-y-4">
          {selected ? (
            <article className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-4 py-5 sm:px-7">
                <p className="text-sm font-semibold text-primary">{lessonUnit(selected)} · Clase {position + 1} de {ordered.length}</p>
                <h2 ref={lessonHeading} tabIndex={-1} className="mt-1 scroll-mt-6 break-words text-2xl font-semibold">{selected.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.estimatedMinutes || 30} minutos · {isCompleted ? "Completada" : "Pendiente"}
                </p>
              </div>

              <nav aria-label="Secciones de la clase" className="grid grid-cols-2 gap-2 border-b border-border p-3 sm:flex sm:flex-wrap sm:px-6">
                {sections.map((section, index) => (
                  <button key={section.title} type="button" aria-pressed={step === index} className={controlClass + " justify-center text-center aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"} onClick={() => setStep(index)}>
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="px-4 py-6 sm:px-7 sm:py-8">
                <h3 className="text-xl font-semibold">{sections[step].title}</h3>
                <div className="mt-4 max-w-prose space-y-4">
                  {sections[step].paragraphs.length ? sections[step].paragraphs.map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-wrap break-words leading-7">{paragraph}</p>
                  )) : <p className="text-sm text-muted-foreground">El docente aún no ha añadido contenido a esta sección.</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3 sm:px-6">
                <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className={controlClass}><ChevronLeft size={16} /> Sección anterior</button>
                <button type="button" disabled={step === sections.length - 1} onClick={() => setStep(step + 1)} className={controlClass}>Siguiente sección <ChevronRight size={16} /></button>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border p-3 sm:px-6">
                <button type="button" disabled={progress.saving} onClick={() => void progress.toggleLessonCompleted(selected.id)} className={controlClass}>
                  <CheckCircle2 size={17} /> {isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
                </button>
                <Link href={`/student/playground?courseId=${encodeURIComponent(courseId)}&lessonId=${encodeURIComponent(selected.id)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                  <Sparkles size={17} /> Practicar esta clase
                </Link>
                {progress.saving && <span role="status" className="text-sm text-muted-foreground">Guardando avance…</span>}
              </div>
            </article>
          ) : !allLoading && !allError && (
            <p className="rounded-2xl border border-border bg-card p-5">Tu docente aún no ha publicado clases.</p>
          )}

          {(previousLesson || nextLesson) && (
            <nav aria-label="Navegación entre clases" className="flex flex-wrap justify-between gap-2">
              {previousLesson && <button type="button" className={controlClass} disabled={progress.saving} onClick={() => openLesson(previousLesson)}><ChevronLeft size={16} /> Clase anterior</button>}
              {nextLesson && <button type="button" className={controlClass + " ml-auto"} disabled={progress.saving} onClick={() => openLesson(nextLesson)}>Siguiente clase <ChevronRight size={16} /></button>}
            </nav>
          )}

          <section aria-label="Herramientas del aula" className="rounded-2xl border border-border bg-card p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {tools.filter(tool => selected || tool.id === "materials" || tool.id === "meetings").map(tool => (
                <button key={tool.id} type="button" aria-expanded={activeTool === tool.id} aria-controls={`classroom-tool-${tool.id}`} className={controlClass + " aria-expanded:border-primary aria-expanded:bg-primary/10"} onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}>
                  {tool.label}
                </button>
              ))}
            </div>
            <div id="classroom-tool-materials" hidden={activeTool !== "materials"} className="pt-4">
              <ResourceList items={publishedMaterials} empty="Aún no hay materiales disponibles." />
            </div>
            <div id="classroom-tool-meetings" hidden={activeTool !== "meetings"} className="pt-4">
              <ResourceList items={publishedMeetings} empty="Aún no hay encuentros disponibles." meetings />
            </div>
            {selected && <>
              <div id="classroom-tool-notes" hidden={activeTool !== "notes"} className="pt-4">
                <LessonNotes key={selected.id} courseId={courseId} lessonId={selected.id} />
              </div>
              <div id="classroom-tool-tutor" hidden={activeTool !== "tutor"} className="pt-4">
                <CourseTutor key={selected.id} courseId={courseId} lessonId={selected.id} />
              </div>
            </>}
          </section>
        </div>
      </div>
    </div>
  );
}

function ResourceList({ items, empty, meetings = false }: { items: (Resource & { id: string })[]; empty: string; meetings?: boolean }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item.id}>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm hover:border-primary">
            <span className="min-w-0 break-words">{item.title}{meetings && item.startsAt ? ` · ${formatAcademicDate(item.startsAt)}` : item.unit ? ` · ${item.unit}` : ""}</span>
            <ExternalLink aria-label="Se abre en otra pestaña" size={16} className="shrink-0 text-primary" />
          </a>
        </li>
      ))}
    </ul>
  );
}
