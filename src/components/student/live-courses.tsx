"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CalendarDays, ClipboardCheck, Search, Sparkles, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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

type CourseEntry = { id: string; course?: Course; failed?: boolean };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function useEnrolledCourses(ids: string[]) {
  const { profile } = useAuth();
  const idsKey = JSON.stringify(ids);
  const source = `${profile?.uid || ""}:${idsKey}`;
  const [snapshot, setSnapshot] = useState<{ source: string; entries: Record<string, CourseEntry> } | null>(null);
  useEffect(() => {
    if (!profile?.uid) return;
    const currentIds: string[] = JSON.parse(idsKey);
    let active = true;
    const update = (id: string, entry: CourseEntry) => {
      if (active) setSnapshot(previous => ({ source, entries: { ...(previous?.source === source ? previous.entries : {}), [id]: entry } }));
    };
    const unsubscribe = currentIds.map(id => onSnapshot(query(collection(db, "courses"), where("__name__", "==", id)), result => {
      const record = result.docs[0];
      update(id, record ? { id, course: record.data() as Course } : { id, failed: true });
    }, () => update(id, { id, failed: true })));
    return () => { active = false; unsubscribe.forEach(stop => stop()); };
  }, [idsKey, profile?.uid, source]);
  const entries = snapshot?.source === source ? snapshot.entries : {};
  return ids.map(id => entries[id] || { id });
}

export function CourseTile({ id, course, tone = 0 }: { id: string; course: Course; tone?: number }) {
  return <Link href={`/student/courses/${encodeURIComponent(id)}`} className={`classroom-card classroom-tone-${tone % 3} group`}>
    <div className="flex items-center justify-between gap-3"><span className="classroom-book"><BookOpen aria-hidden="true" className="h-6 w-6" /></span><span className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold">{course.code || "Materia"}</span></div>
    <h3 className="mt-7 text-xl font-semibold leading-snug">{course.name}</h3>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/85">{course.description || "Consulta las clases y materiales publicados por tu docente."}</p>
    <div className="classroom-enter mt-7"><span>Entrar al aula</span><ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" /></div>
  </Link>;
}

export function LiveCourses({ home = false }: { home?: boolean }) {
  const { profile } = useAuth();
  const enrollment = useStudentEnrollments();
  const ids = [...new Set(enrollment.data.filter(e => e.status === "active").map(e => e.courseId))].sort();
  const entries = useEnrolledCourses(ids);
  const [search, setSearch] = useState("");
  const term = normalize(search.trim());
  const ready = entries.filter((e): e is CourseEntry & { course: Course } => !!e.course);
  const matching = ready.filter(e => normalize(`${e.course.name} ${e.course.code} ${e.course.description}`).includes(term));
  const pending = enrollment.loading || entries.some(e => !e.course && !e.failed);
  return <div className="student-lobby space-y-7">
    <header className="student-welcome">
      <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{home ? "Tu salón virtual" : "Tus aulas"}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{home ? `Hola, ${profile?.name?.split(" ")[0] || "estudiante"}.` : "Mis materias"}</h1><p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{home ? "¿Qué quieres aprender hoy? Elige una materia y entra a sus clases." : "Todas tus materias inscritas, con sus clases y materiales."}</p></div>
      <Link href="/student/playground" className="student-practice-link"><Sparkles aria-hidden="true" className="h-5 w-5" /><span><strong className="block text-sm">Practica con IA</strong><span className="text-xs text-muted-foreground">Refuerza lo que aprendiste</span></span><ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link>
    </header>
    <section aria-labelledby="my-classrooms">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><h2 id="my-classrooms" className="text-xl font-semibold">{home ? "Entra a tu próxima clase" : "Mis aulas"}</h2><p className="mt-1 text-xs text-muted-foreground">{ids.length} {ids.length === 1 ? "materia inscrita" : "materias inscritas"}</p></div>
        <div className="relative w-full sm:w-80"><Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input type="search" aria-label="Buscar mis materias" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar una materia o código" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-11 text-sm" />{search && <button aria-label="Limpiar búsqueda de materias" onClick={() => setSearch("")} className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg"><X className="h-4 w-4" /></button>}</div>
      </div>
      {enrollment.error && <p role="alert" className="mb-4 rounded-xl border border-danger/40 p-4">{enrollment.error}</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{matching.map(e => <CourseTile key={e.id} id={e.id} course={e.course} tone={ids.indexOf(e.id)} />)}{entries.filter(e => e.failed).map(e => <div key={e.id} role="alert" className="rounded-3xl border border-border bg-card p-6"><p>No se pudo cargar una de tus materias.</p><p className="mt-2 text-sm text-muted-foreground">Revisa tu conexión o consulta con tu docente.</p></div>)}</div>
      {pending && <div role="status" className="mt-5 rounded-2xl bg-muted p-5 text-sm">Cargando tus aulas…</div>}
      {!pending && !enrollment.error && !ids.length && <div className="student-empty"><BookOpen aria-hidden="true" className="mx-auto h-8 w-8 text-primary" /><h3 className="mt-4 text-lg font-semibold">Tu primera clase empieza aquí</h3><p className="mt-2 text-sm text-muted-foreground">Todavía no tienes materias inscritas. Tu docente o administrador puede vincularte a una sección.</p></div>}
      {!pending && ready.length > 0 && !matching.length && <div className="student-empty" role="status"><h3 className="font-semibold">No encontramos esa materia</h3><p className="mt-2 text-sm text-muted-foreground">Prueba con su nombre o código.</p><button onClick={() => setSearch("")} className="mt-4 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Ver todas mis materias</button></div>}
    </section>
    <nav aria-label="Herramientas de aprendizaje" className="grid gap-3 sm:grid-cols-2">
      <Link href="/student/calendar" className="student-tool-link"><CalendarDays aria-hidden="true" className="h-5 w-5 text-primary" /><div><p className="font-semibold">Mi calendario</p><p className="mt-1 text-xs text-muted-foreground">Consulta los encuentros publicados</p></div><ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link>
      <Link href="/student/exams" className="student-tool-link"><ClipboardCheck aria-hidden="true" className="h-5 w-5 text-primary" /><div><p className="font-semibold">Mis evaluaciones</p><p className="mt-1 text-xs text-muted-foreground">Revisa las actividades de tus materias</p></div><ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" /></Link>
    </nav>
  </div>;
}
export function useLiveCourse(id: string) {
  const { profile } = useAuth();
  const ref = useMemo(() => profile && id ? query(collection(db, "courses"), where("__name__", "==", id)) : null, [id, profile]);
  return useLiveQuery<Course>(ref);
}
