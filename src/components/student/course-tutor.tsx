"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";

export function CourseTutor({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setLoading(true); setError(""); setAnswer("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/ai/course", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ courseId, question }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No fue posible responder.");
      setAnswer(payload.answer);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible responder."); }
    finally { setLoading(false); }
  }
  return <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Preguntar a la IA</h2><p className="mt-2 text-sm text-muted-foreground">El tutor usa planificaciones publicadas por tu docente.</p>
    <form onSubmit={submit} className="mt-4 space-y-3"><textarea required minLength={3} maxLength={1200} value={question} onChange={e => setQuestion(e.target.value)} placeholder="¿Qué concepto quieres practicar?" className="min-h-28 w-full rounded-xl border p-3" /><button disabled={loading} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? "Consultando…" : "Preguntar"}</button></form>
    {error && <p role="alert" className="mt-4 text-red-500">{error}</p>}{answer && <div className="mt-4 whitespace-pre-wrap rounded-xl border p-4 leading-7">{answer}</div>}
  </section>;
}
