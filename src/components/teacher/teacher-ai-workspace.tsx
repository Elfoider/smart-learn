"use client";

import { useState, type FormEvent } from "react";
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
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setLoading(true); setResult("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ai/teacher", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId, task, topic, instructions }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo generar.");
      setResult(payload.result);
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
      <button disabled={loading} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? "Generando…" : "Generar borrador"}</button>
    </form>
    {result && <div className="space-y-3 rounded-3xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Borrador editable</h2><textarea aria-label="Borrador generado" value={result} onChange={e => setResult(e.target.value)} className="min-h-96 w-full rounded-xl border p-4 leading-7" /><button onClick={() => navigator.clipboard.writeText(result).then(() => toast.success("Copiado"))} className="rounded-xl border px-4 py-2">Copiar texto</button></div>}
  </div>;
}
