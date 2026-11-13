"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherPlans } from "@/hooks/use-teacher-plans";
import { TeacherPlanningDialog } from "./teacher-planning-dialog";
import { teacherDraftTasks, teacherDraftTemplates, type GeneratedLesson, type TeacherDraftTask } from "@/lib/teacher/ai-drafts";

export function TeacherAiWorkspace() {
  const { user } = useAuth();
  const { courses, sections, loading: coursesLoading, error: courseError } = useTeacherCourses();
  const { createPlan, editPlan, saving } = useTeacherPlans();
  const [courseId, setCourseId] = useState("");
  const [task, setTask] = useState<TeacherDraftTask>("plan");
  const [structuredPlan, setStructuredPlan] = useState(true);
  const [generatedDraft, setGeneratedDraft] = useState<(GeneratedLesson & { courseId: string }) | null>(null);
  const [reviewDraft, setReviewDraft] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [topic, setTopic] = useState("");
  const [taskInstructions, setTaskInstructions] = useState<Partial<Record<TeacherDraftTask, string>>>({});
  const instructions = taskInstructions[task] ?? "";
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [reading, setReading] = useState(false);
  const [resultTask, setResultTask] = useState<TeacherDraftTask | null>(null);
  const [resultTitle, setResultTitle] = useState("");
  const [resultCourse, setResultCourse] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function readReference(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReference("");
    setReferenceName("");
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt") || file.size > 16_384) {
      event.target.value = "";
      toast.error("Selecciona un archivo TXT de hasta 16 KB.");
      return;
    }
    setReading(true);
    try {
      const text = (await file.text()).trim();
      if (!text || text.includes("\0")) throw new Error("El archivo no contiene texto válido.");
      setReference(text.slice(0, 3000));
      setReferenceName(file.name);
      if (text.length > 3000) toast.info("Se usarán los primeros 3000 caracteres del archivo.");
    } catch (error) {
      if (fileInput.current) fileInput.current.value = "";
      toast.error(error instanceof Error ? error.message : "No se pudo leer el archivo.");
    } finally {
      setReading(false);
    }
  }

  function clearReference() {
    setReference("");
    setReferenceName("");
    if (fileInput.current) fileInput.current.value = "";
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || loading || reading) return;
    setLoading(true);
    setGenerationError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ai/teacher", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId, task, topic, instructions, reference, structuredPlan: task === "plan" && structuredPlan }) });
      const payload = await response.json().catch(() => null);
      if (response.status === 504 && !payload?.error) {
        throw new Error(task === "quiz"
          ? "La generación superó el tiempo de espera. Intenta con 2 o 3 preguntas."
          : "La generación superó el tiempo de espera. Intenta con un borrador más breve.");
      }
      if (!response.ok) throw new Error(payload?.error || "No se pudo generar.");
      if (typeof payload?.result !== "string" || !payload.result.trim()) throw new Error("La IA no devolvió un borrador.");
      setResult(payload.result);
      setResultTask(task);
      setGeneratedDraft(payload.lesson ? { ...payload.lesson, courseId } : null);
      setResultTitle(topic.trim());
      setResultCourse(courses.find(course => course.id === courseId)?.name ?? "");
    } catch (error) { setGenerationError(error instanceof Error ? error.message : "No fue posible generar el borrador."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><h1 className="text-3xl font-semibold">Asistente IA docente</h1><p className="mt-2 text-white/70">Genera borradores para tu asignatura a partir del tema que indiques. Revisa el resultado antes de utilizarlo.</p></header>
    <form onSubmit={submit} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-3xl border border-border bg-card p-4 sm:p-6">
      <fieldset disabled={loading || reading} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
        <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 text-sm font-medium">Asignatura
          <select required aria-label="Asignatura" value={courseId} onChange={event => setCourseId(event.target.value)} className="w-full min-w-0 rounded-xl border bg-background p-3">
            <option value="">Selecciona asignatura</option>
            {courses.filter(course => course.status !== "archived").map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 text-sm font-medium">Qué quieres generar
          <select aria-label="Qué quieres generar" value={task} onChange={event => {
            setTask(event.target.value as TeacherDraftTask);
            setGenerationError("");
          }} className="w-full min-w-0 rounded-xl border bg-background p-3">
            {teacherDraftTasks.map(value => <option key={value} value={value}>{teacherDraftTemplates[value].label}</option>)}
          </select>
        </label>
        <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 text-sm font-medium">Tema
          <input required minLength={3} maxLength={220} aria-describedby="teacher-topic-hint" value={topic} onChange={event => setTopic(event.target.value)} className="w-full min-w-0 rounded-xl border bg-background p-3" />
        </label>
        <p id="teacher-topic-hint" className="text-sm text-muted-foreground">{teacherDraftTemplates[task].hint}</p>
        <label className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-1 text-sm font-medium">Instrucciones adicionales
          <textarea maxLength={1200} value={instructions} placeholder={task === "quiz" ? "Ejemplo: 3 preguntas de dificultad básica, con respuestas al final." : undefined} onChange={event => setTaskInstructions(previous => ({ ...previous, [task]: event.target.value }))} className="min-h-28 w-full min-w-0 rounded-xl border bg-background p-3" />
        </label>
        {task === "plan" && <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={structuredPlan} onChange={event => setStructuredPlan(event.target.checked)} />
          Preparar para el formulario de Planificación
        </label>}
      </fieldset>
      {courseError && <p role="alert" className="text-sm text-danger">{courseError}</p>}
      <div className="rounded-xl border border-border p-4">
        <label htmlFor="teacher-reference" className="block text-sm font-medium">Archivo de referencia (opcional)</label>
        <input ref={fileInput} id="teacher-reference" type="file" accept=".txt,text/plain" disabled={reading || loading} onChange={readReference} className="mt-2 block w-full min-w-0 max-w-full text-sm" />
        <p className="mt-2 text-xs text-muted-foreground">TXT en UTF-8, hasta 16 KB. Se usan como máximo 3000 caracteres para generar el borrador.</p>
        {referenceName && <button type="button" onClick={clearReference} disabled={loading} className="mt-2 text-sm text-primary underline">Quitar referencia</button>}
      </div>
      <button disabled={loading || reading || coursesLoading || !courseId} className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">
        {loading ? "Generando…" : "Generar borrador"}
      </button>
      {loading && <p role="status" className="text-sm text-muted-foreground">La primera consulta puede tardar mientras inicia el modelo.</p>}
      {generationError && <p role="alert" className="text-sm text-danger">{generationError}</p>}
    </form>
    {result && resultTask === task && <section className="space-y-3 rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{loading || generationError ? "Borrador anterior" : generatedDraft ? "Planificación generada" : task === "quiz" ? "Banco de preguntas" : "Borrador editable"}</h2>
      {generatedDraft && <p className="text-sm text-muted-foreground">Abre el formulario para editar el contenido, asignar fechas y seleccionar la sección.</p>}
      <textarea aria-label="Borrador generado" value={result} readOnly={Boolean(generatedDraft)} onChange={event => setResult(event.target.value)} className="min-h-72 w-full rounded-xl border p-4 leading-7" />
      <div className="flex flex-wrap gap-2">
        {generatedDraft && <button type="button" disabled={loading} onClick={() => setReviewDraft(true)} className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50">Editar en Planificación</button>}
        <button type="button" onClick={() => navigator.clipboard.writeText(result).then(() => toast.success("Copiado")).catch(() => toast.error("No se pudo copiar el texto."))} className="rounded-xl border px-4 py-2">Copiar texto</button>
        <button type="button" disabled={!result.trim()} onClick={() => openPrintView(resultTitle, resultCourse, result)} className="rounded-xl border px-4 py-2 disabled:opacity-50">Guardar como PDF</button>
      </div>
    </section>}
    {reviewDraft && generatedDraft && (
      <TeacherPlanningDialog
        generatedDraft={generatedDraft}
        courses={courses}
        sections={sections}
        saving={saving}
        onClose={() => setReviewDraft(false)}
        onCreate={createPlan}
        onUpdate={editPlan}
      />
    )}
  </div>;
}


function openPrintView(title: string, course: string, result: string) {
  const tab = window.open("about:blank", "_blank");
  if (!tab) {
    toast.error("Permite las ventanas emergentes para abrir la vista de impresión.");
    return;
  }
  tab.opener = null;
  const document = tab.document;
  document.documentElement.lang = "es";
  document.title = title || "Borrador académico";
  const styles = document.createElement("style");
  styles.textContent = `
    @page { margin: 18mm; }
    body { margin: 28px auto; max-width: 760px; padding: 0 18px; color: #142137; font: 15px/1.55 system-ui, sans-serif; }
    header { border-bottom: 2px solid #137b99; margin-bottom: 22px; padding-bottom: 12px; }
    h1 { margin: 4px 0; font-size: 27px; overflow-wrap: anywhere; }
    p { margin: 0; overflow-wrap: anywhere; }
    main { white-space: pre-wrap; overflow-wrap: anywhere; }
    button { margin-bottom: 18px; padding: 8px 14px; }
    @media print { button { display: none; } body { margin: 0; padding: 0; } }
  `;
  document.head.append(styles);
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Imprimir o guardar como PDF";
  button.addEventListener("click", () => tab.print());
  const header = document.createElement("header");
  const brand = document.createElement("p");
  brand.textContent = "Smart Learn";
  const heading = document.createElement("h1");
  heading.textContent = title || "Borrador académico";
  const subject = document.createElement("p");
  subject.textContent = course;
  header.append(brand, heading, subject);
  const content = document.createElement("main");
  content.textContent = result;
  document.body.append(button, header, content);
}
