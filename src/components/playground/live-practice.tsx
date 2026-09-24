"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStudentEnrollments, useLiveCourse } from "@/components/student/live-courses";
import { usePlaygroundSession } from "@/hooks/use-playground-session";

type Challenge = { challengeId: string; question: string; options: string[] };
type Feedback = { correct: boolean; correctAnswer: string; explanation: string };

export function LivePractice() {
  const { user } = useAuth();
  const enrolled = useStudentEnrollments();
  const [courseId, setCourseId] = useState("");
  const [topic, setTopic] = useState("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { session } = usePlaygroundSession({ courseId: courseId || "sin-materia", topicId: "real", initialExerciseId: "" });
  async function send(payload: unknown) {
    if (!user) throw new Error("Inicia sesión.");
    const token = await user.getIdToken();
    const res = await fetch("/api/ai/practice", { method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No fue posible practicar.");
    return data;
  }
  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setFeedback(null); setChallenge(null);
    try { setChallenge(await send({ action: "generate", courseId, topic })); setAnswer(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Error al generar."); }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!challenge || answer === "") return;
    setLoading(true); setError("");
    try { setFeedback(await send({ action: "submit", challengeId: challenge.challengeId, answer })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Error al responder."); }
    finally { setLoading(false); }
  }
  const ids = enrolled.data.filter(e => e.status === "active").map(e => e.courseId);
  return <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
    <div><p className="text-sm font-semibold text-teal-600">Materias inscritas</p><h2 className="text-2xl font-semibold">Practicar mi materia</h2><p className="mt-2 text-sm text-muted-foreground">Un ejercicio nuevo basado en planificaciones publicadas por tu docente. Tus intentos se guardan en Firestore.</p></div>
    {enrolled.error && <p role="alert">{enrolled.error}</p>}
    {!ids.length && !enrolled.loading && <p>Pide a tu docente que te inscriba en una materia para practicar aquí.</p>}
    <form onSubmit={generate} className="grid gap-3">
      <fieldset><legend className="mb-2 text-sm font-semibold">Elige una materia</legend><div className="flex flex-wrap gap-2">{ids.map(id => <SubjectButton key={id} id={id} selected={courseId === id} onSelect={() => { setCourseId(id); setChallenge(null); setFeedback(null); }} />)}</div></fieldset>
      <input required minLength={3} maxLength={160} placeholder="Tema que quieres practicar" value={topic} onChange={e => setTopic(e.target.value)} className="rounded-xl border p-3" />
      <button disabled={!courseId || loading} className="w-fit rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{loading ? "Preparando…" : "Crear ejercicio"}</button>
    </form>
    {courseId && <p className="text-sm text-muted-foreground">Intentos registrados: {session.attempts} · Aciertos: {session.correctAnswers}</p>}
    {error && <p role="alert" className="text-red-500">{error}</p>}
    {challenge && <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border p-5"><h3 className="text-lg font-semibold">{challenge.question}</h3>
      {challenge.options.map((option, index) => <label key={index} className="flex items-center gap-3 rounded-xl border p-3"><input type="radio" name="practice-answer" value={index} checked={answer === String(index)} onChange={e => setAnswer(e.target.value)} disabled={!!feedback} />{option}</label>)}
      {!feedback && <button type="submit" disabled={loading || answer === ""} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">Comprobar respuesta</button>}
      {feedback && <div role="status" className="rounded-xl bg-secondary p-4"><strong>{feedback.correct ? "¡Correcto!" : "Sigue practicando"}</strong><p className="mt-2">Respuesta: {feedback.correctAnswer}</p><p className="mt-2">{feedback.explanation}</p></div>}
    </form>}
  </section>;
}
function SubjectButton({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  const { data } = useLiveCourse(id);
  return <button type="button" aria-pressed={selected} onClick={onSelect} className="rounded-xl border px-4 py-2 text-sm aria-pressed:bg-teal-500 aria-pressed:text-slate-950">{data[0]?.name || "Materia"}</button>;
}
