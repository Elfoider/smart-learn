"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, FileText, FolderOpen, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherPlans } from "@/hooks/use-teacher-plans";
import { useTeacherAssessments } from "@/hooks/use-teacher-assessments";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import { formatAcademicDate, safeMeetingUrl } from "@/lib/student/experience";

const actions = [
  { href: "/teacher/planning", label: "Planificación", icon: BookOpen },
  { href: "/teacher/materials", label: "Materiales", icon: FolderOpen },
  { href: "/teacher/online-classes", label: "Clases en línea", icon: CalendarDays },
  { href: "/teacher/assessments", label: "Evaluaciones y notas", icon: ClipboardCheck },
  { href: "/teacher/attendance", label: "Asistencia", icon: Users },
  { href: "/teacher/ai", label: "Asistente IA", icon: Sparkles },
];

type Meeting = {
  courseId: string;
  sectionId?: string | null;
  title: string;
  url: string;
  startsAt?: string | null;
  visibleToStudents?: boolean;
};

export function TeacherDashboard() {
  const { profile } = useAuth();
  const teacherId = profile?.uid;
  const workspace = useTeacherCourses();
  const planning = useTeacherPlans();
  const assessment = useTeacherAssessments();
  const meetingsRef = useMemo(() => teacherId
    ? query(collection(db, "onlineClasses"), where("teacherId", "==", teacherId))
    : null, [teacherId]);
  const meetings = useLiveQuery<Meeting>(meetingsRef);
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const courses = workspace.courses.filter(course => course.status !== "archived");
  const course = courses.find(item => item.id === courseId);
  const sections = workspace.sections.filter(section => section.courseId === course?.id);
  const section = sections.find(item => item.id === sectionId);
  const courseNames = new Map(courses.map(item => [item.id, item.name]));
  const inScope = (item: { courseId: string; sectionId?: string | null }) =>
    courseNames.has(item.courseId) && (!course || item.courseId === course.id) &&
    (!section || !item.sectionId || item.sectionId === section.id);

  const lessonDrafts = planning.plans.filter(item => item.status !== "archived" && !item.visibleToStudents && inScope(item));
  const assessmentDrafts = assessment.assessments.filter(item => item.status === "draft" && inScope(item));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const upcoming = meetings.data
    .filter(item => item.visibleToStudents && inScope(item) && Date.parse(item.startsAt ?? "") >= now)
    .sort((left, right) => Date.parse(left.startsAt ?? "") - Date.parse(right.startsAt ?? ""))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <header className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">Portal docente</h1>
            <p className="mt-2 text-sm text-muted-foreground">Consulta tus próximas clases y revisa lo que falta publicar.</p>
          </div>
          <Link href="/teacher/courses" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Mis asignaturas <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <nav aria-label="Herramientas docentes" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-h-12 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium hover:border-primary">
            <Icon size={17} className="shrink-0 text-primary" /> {label}
          </Link>
        ))}
      </nav>

      <section aria-label="Alcance del inicio docente" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Asignatura
          <select aria-label="Asignatura" className="mt-2 w-full rounded-lg border border-border bg-background p-2.5" value={course?.id ?? ""} disabled={workspace.loading} onChange={event => { setCourseId(event.target.value); setSectionId(""); }}>
            <option value="">Todas las asignaturas</option>
            {courses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Sección
          <select aria-label="Sección" className="mt-2 w-full rounded-lg border border-border bg-background p-2.5 disabled:opacity-60" value={section?.id ?? ""} disabled={!course || !sections.length} onChange={event => setSectionId(event.target.value)}>
            <option value="">Todas las secciones</option>
            {sections.map(item => <option key={item.id} value={item.id}>{item.code}</option>)}
          </select>
        </label>
      </section>

      {workspace.error && <p role="alert" className="text-sm text-destructive">{workspace.error}</p>}
      {!workspace.loading && !workspace.error && !courses.length && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm">Todavía no tienes asignaturas disponibles. <Link href="/teacher/courses" className="text-primary underline">Ir a asignaturas</Link></p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarDays size={19} className="text-primary" /> Próximos encuentros</h2>
          {meetings.error ? <p role="alert" className="mt-3 text-sm">{meetings.error}</p>
            : meetings.loading || workspace.loading ? <p role="status" className="mt-3 text-sm">Cargando encuentros…</p>
            : !upcoming.length ? <p className="mt-3 text-sm text-muted-foreground">No hay encuentros futuros publicados para esta selección.</p>
            : <ul className="mt-3 space-y-2">{upcoming.map(item => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{courseNames.get(item.courseId)} · {formatAcademicDate(item.startsAt ?? undefined)}</p>
                </div>
                {safeMeetingUrl(item.url) && <a className="text-sm font-semibold text-primary underline" href={item.url} target="_blank" rel="noopener noreferrer">Abrir enlace</a>}
              </li>
            ))}</ul>}
          <Link href="/teacher/online-classes" className="mt-4 inline-block text-sm font-semibold text-primary underline">Gestionar encuentros</Link>
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><FileText size={19} className="text-primary" /> Por publicar</h2>
          {(planning.error || assessment.error) && <p role="alert" className="mt-3 text-sm">No se pudieron cargar todos los pendientes.</p>}
          {workspace.loading || planning.loading || assessment.loading ? <p role="status" className="mt-3 text-sm">Cargando pendientes…</p>
            : <div className="mt-3 space-y-4">
              <PendingList href="/teacher/planning" label="Planificaciones ocultas" items={lessonDrafts} />
              <PendingList href="/teacher/assessments" label="Evaluaciones en borrador" items={assessmentDrafts} />
            </div>}
        </section>
      </div>
    </div>
  );
}

function PendingList({ href, label, items }: { href: string; label: string; items: { id: string; title: string }[] }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex flex-wrap justify-between gap-2">
        <h3 className="text-sm font-semibold">{label}</h3>
        <Link href={href} className="text-sm font-semibold text-primary underline">Gestionar</Link>
      </div>
      {items.length
        ? <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">{items.slice(0, 4).map(item => <li key={item.id} className="break-words">{item.title}</li>)}</ul>
        : <p className="mt-2 text-sm text-muted-foreground">Ninguna para esta selección.</p>}
      {items.length > 4 && <p className="mt-2 text-xs text-muted-foreground">{items.length} en total</p>}
    </div>
  );
}
