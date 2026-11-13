"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Grid2X2, List, Search } from "lucide-react";
import { useStudentWorkspace, type Course } from "@/hooks/use-student-workspace";
import { courseLearning } from "@/lib/student/experience";
export { useStudentEnrollments, useLiveCourse, type Enrollment, type Course } from "@/hooks/use-student-workspace";
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function CourseTile({ id, course, tone = 0, progress, compact = false }: { id: string; course: Course; tone?: number; progress?: { completed: number; total: number; percent: number }; compact?: boolean }) {
  return <Link href={`/student/courses/${encodeURIComponent(id)}`} className={`classroom-card classroom-tone-${tone % 3} group ${compact ? "classroom-card-compact" : ""}`}>
    <div className="flex items-center justify-between gap-3"><span className="classroom-book"><BookOpen aria-hidden="true" className="h-6 w-6" /></span><span className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold">{course.code || "Materia"}</span></div>
    <h3 className="mt-6 text-xl font-semibold leading-snug">{course.name}</h3>
    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/85">{course.description || "Consulta las clases y materiales de tu docente."}</p>
    {progress && <div className="mb-5 text-xs"><div className="mb-2 flex justify-between gap-3"><span>{progress.total ? `${progress.completed} de ${progress.total} clases completadas` : "Clases por publicar"}</span>{progress.total > 0 && <span>{progress.percent}%</span>}</div>{progress.total > 0 && <progress aria-label={`Avance en ${course.name}`} value={progress.percent} max={100} className="course-progress" />}</div>}
    <div className="classroom-enter"><span>Entrar al aula</span><ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" /></div>
  </Link>;
}
export function LiveCourses() {
  const workspace = useStudentWorkspace("courses");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("name");
  const term = normalize(search.trim());
  const ready = workspace.courses.flatMap(e => e.course ? [{ id: e.id, course: e.course, learning: courseLearning(workspace.lessons.data, e.id, workspace.progress.data.find(p => p.courseId === e.id)) }] : []);
  const matching = ready.filter(e => normalize(`${e.course.name} ${e.course.code} ${e.course.description}`).includes(term) && (filter === "all" || e.learning.state === filter)).sort((a,b) => (sort === "code" ? a.course.code.localeCompare(b.course.code) : a.course.name.localeCompare(b.course.name, "es")));
  const loading = workspace.loading || workspace.lessons.loading || workspace.progress.loading;
  return <div className="student-lobby space-y-6">
    <header className="student-welcome"><div><p className="eyebrow">Tu biblioteca de aulas</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Mis materias</h1><p className="mt-3 text-muted-foreground">Explora tus asignaturas, encuentra una clase y organiza tu aprendizaje.</p></div><span className="catalog-count">{workspace.enrollment.loading ? "…" : workspace.courses.length}<small>materias inscritas</small></span></header>
    <section aria-label="Organizar mis materias" className="workspace-panel space-y-4">
      <div className="flex flex-wrap items-center gap-3"><label className="workspace-search min-w-0 flex-1"><Search aria-hidden="true" className="h-4 w-4" /><input type="search" aria-label="Buscar mis materias" placeholder="Nombre, código o descripción" value={search} onChange={e => setSearch(e.target.value)} /></label><select aria-label="Ordenar materias" value={sort} onChange={e => setSort(e.target.value)} className="workspace-select"><option value="name">Nombre A–Z</option><option value="code">Código</option></select><div className="flex gap-1"><button className="portal-icon" aria-label="Ver tarjetas" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 className="h-4 w-4" /></button><button className="portal-icon" aria-label="Ver lista" aria-pressed={view === "list"} onClick={() => setView("list")}><List className="h-4 w-4" /></button></div></div>
      <div className="workspace-filters" aria-label="Filtrar por avance">{[["all","Todas"],["started","En curso"],["new","Por comenzar"],["completed","Completadas"]].map(([value,label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
    </section>
    {(workspace.error || workspace.lessons.error || workspace.progress.error) && <p role="alert" className="workspace-panel">No se pudo cargar parte de tu información. Recarga la página para reintentar.</p>}
    {loading && <p role="status" className="workspace-panel">Cargando tus aulas y su avance…</p>}
    <div className={view === "grid" ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3" : "course-list grid gap-4"}>{matching.map(e => <CourseTile key={e.id} id={e.id} course={e.course} tone={workspace.courses.findIndex(c => c.id === e.id)} progress={!workspace.lessons.loading && !workspace.lessons.error && !workspace.progress.loading && !workspace.progress.error ? e.learning : undefined} compact={view === "list"} />)}</div>
    {!loading && !workspace.error && !matching.length && <div className="student-empty"><BookOpen className="mx-auto h-8 w-8 text-primary" aria-hidden="true" /><h2 className="mt-4 text-lg font-semibold">{ready.length ? "No hay materias con estos filtros" : "Tu primera clase empieza aquí"}</h2><p className="mt-2 text-sm text-muted-foreground">{ready.length ? "Cambia la búsqueda o el estado de avance." : "Tu docente o administrador puede inscribirte en una sección."}</p>{ready.length > 0 && <button className="workspace-action mt-5" onClick={() => {setSearch("");setFilter("all");}}>Ver todas mis materias</button>}</div>}
  </div>;
}
