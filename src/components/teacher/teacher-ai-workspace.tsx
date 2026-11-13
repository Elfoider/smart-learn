"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";

export function TeacherAiWorkspace() {
  const { user } = useAuth();
  const { courses } = useTeacherCourses();
  const [courseId, setCourseId] = useState("");
  const [task, setTask] = useState<"plan" | "activity" | "rubric">("plan");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [referenceName, setReferenceName] = useState("");
  const [reading, setReading] = useState(false);
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
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ai/teacher", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId, task, topic, instructions, reference }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo generar.");
      setResult(payload.result);
      setResultTitle(topic.trim());
      setResultCourse(courses.find(course => course.id === courseId)?.name ?? "");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible generar el borrador."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><h1 className="text-3xl font-semibold">Asistente IA docente</h1><p className="mt-2 text-white/70">Genera borradores basados en tu materia y planificaciones. Revisa el resultado antes de utilizarlo.</p></header>
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-border bg-card p-6">
      <select required aria-label="Materia" value={courseId} onChange={e => setCourseId(e.target.value)} className="rounded-xl border p-3"><option value="">Selecciona materia</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select aria-label="Tipo de borrador" value={task} onChange={e => setTask(e.target.value as typeof task)} className="rounded-xl border p-3"><option value="plan">Plan de clase</option><option value="activity">Actividad</option><option value="rubric">Rúbrica</option></select>
      <input required minLength={3} maxLength={220} placeholder="Tema" value={topic} onChange={e => setTopic(e.target.value)} className="rounded-xl border p-3" />
      <textarea maxLength={1200} placeholder="Instrucciones adicionales" value={instructions} onChange={e => setInstructions(e.target.value)} className="min-h-28 rounded-xl border p-3" />
      <div className="rounded-xl border border-border p-4">
        <label htmlFor="teacher-reference" className="block text-sm font-medium">Archivo de referencia (opcional)</label>
        <input ref={fileInput} id="teacher-reference" type="file" accept=".txt,text/plain" disabled={reading || loading} onChange={readReference} className="mt-2 block max-w-full text-sm" />
        <p className="mt-2 text-xs text-muted-foreground">TXT en UTF-8, hasta 16 KB. Se usan como máximo 3000 caracteres para generar el borrador.</p>
        {referenceName && <button type="button" onClick={clearReference} disabled={loading} className="mt-2 text-sm text-primary underline">Quitar referencia</button>}
      </div>
      <button disabled={loading || reading} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? "Generando…" : "Generar borrador"}</button>
    </form>
    {result && <div className="space-y-3 rounded-3xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Borrador editable</h2><textarea aria-label="Borrador generado" value={result} onChange={e => setResult(e.target.value)} className="min-h-96 w-full rounded-xl border p-4 leading-7" /><button onClick={() => navigator.clipboard.writeText(result).then(() => toast.success("Copiado")).catch(() => toast.error("No se pudo copiar el texto."))} className="rounded-xl border px-4 py-2">Copiar texto</button>
      <button type="button" disabled={!result.trim()} onClick={() => openPrintView(resultTitle, resultCourse, result)} className="ml-2 rounded-xl border px-4 py-2 disabled:opacity-50">Guardar como PDF</button>
    </div>}
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
