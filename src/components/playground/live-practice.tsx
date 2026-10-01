"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Sparkles, RotateCcw, Lightbulb, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useStudentEnrollments, useLiveCourse } from "@/components/student/live-courses";
import { usePlaygroundSession } from "@/hooks/use-playground-session";
import { CourseTutor } from "@/components/student/course-tutor";

type Lesson = { id: string; title: string; unit: string };
type Challenge = { challengeId: string; question: string; options: string[]; hint: string; lessonId?: string; difficulty?: string; provider?: string };
type Feedback = { correct: boolean; correctAnswer: string; explanation: string };
type History = { id: string; question: string; topic: string; correct: boolean; difficulty: string };
const field = "w-full rounded-xl border border-border bg-background p-3 text-sm";
const button = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50";

export function LivePractice({ initialCourseId = "", initialLessonId = "" }: { initialCourseId?: string; initialLessonId?: string }) {
  const enrollment = useStudentEnrollments();
  const [chosen, setChosen] = useState(initialCourseId);
  const ids = [...new Set(enrollment.data.filter(e => e.status === "active").map(e => e.courseId))];
  const courseId = ids.includes(chosen) ? chosen : ids[0] || "";
  return <section className="space-y-6">
    <header className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 md:p-9">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Sparkles size={17} /> Práctica inteligente</p>
      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Aprende practicando</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Elige una clase, recibe un ejercicio nuevo y descubre cómo mejorar. Las preguntas se basan en el contenido publicado por tu docente.</p>
    </header>
    {enrollment.loading && <p role="status">Cargando tus materias…</p>}
    {enrollment.error && <p role="alert" className="text-red-500">{enrollment.error}</p>}
    {!enrollment.loading && !ids.length && <div className="rounded-3xl border border-border bg-card p-8"><BookOpen className="mb-3 text-primary" /><h2 className="text-xl font-semibold">Tu espacio de práctica está listo</h2><p className="mt-2 text-muted-foreground">Necesitas una matrícula activa y clases publicadas. Pide a tu docente que te inscriba.</p><Link href="/student/courses" className="mt-4 inline-block text-primary underline">Ver mis materias</Link></div>}
    {ids.length > 0 && <><div className="flex flex-wrap gap-2" aria-label="Seleccionar materia">{ids.map(id => <SubjectButton key={id} id={id} selected={courseId === id} onSelect={() => setChosen(id)} />)}</div>
      <PracticeCourse key={courseId} courseId={courseId} initialLessonId={initialCourseId === courseId ? initialLessonId : ""} /></>}
  </section>;
}
function PracticeCourse({ courseId, initialLessonId }: { courseId: string; initialLessonId: string }) {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonId, setLessonId] = useState(initialLessonId);
  const [difficulty, setDifficulty] = useState("basico");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState("");
  const { session } = usePlaygroundSession({ courseId, topicId: "real", initialExerciseId: "" });
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user.getIdToken().then(token => fetch(`/api/ai/practice?courseId=${encodeURIComponent(courseId)}`, { headers: { Authorization: `Bearer ${token}` } }))
      .then(async res => { const data = await res.json(); if (!res.ok) throw new Error(data.error); return data; })
      .then(data => {
        if (cancelled) return;
        setLessons(data.lessons); setHistory(data.history);
        const selected = data.lessons.some((l: Lesson) => l.id === initialLessonId) ? initialLessonId : data.pending?.lessonId || data.lessons[0]?.id || "";
        setLessonId(selected);
        if (data.pending?.lessonId === selected) { setChallenge(data.pending); setDifficulty(data.pending.difficulty || "basico"); }
        setCatalogLoading(false);
      }).catch(cause => { if (!cancelled) { setError(cause.message || "No se pudieron cargar las clases."); setCatalogLoading(false); } });
    return () => { cancelled = true; };
  }, [courseId, initialLessonId, user]);
  async function send(payload: unknown) {
    if (!user) throw new Error("Inicia sesión.");
    const token = await user.getIdToken();
    const response = await fetch("/api/ai/practice", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No fue posible practicar.");
    return data;
  }
  async function generate() {
    setLoading(true); setError("");
    try {
      const data = await send({ action: "generate", courseId, lessonId, difficulty });
      setChallenge(data); setAnswer(""); setFeedback(null); setShowHint(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Error al generar."); }
    finally { setLoading(false); }
  }
  async function submit() {
    if (!challenge || answer === "") return;
    setLoading(true); setError("");
    try {
      const result = await send({ action: "submit", challengeId: challenge.challengeId, answer });
      setFeedback(result);
      setHistory(old => [{ id: challenge.challengeId, question: challenge.question, topic: lessons.find(l => l.id === lessonId)?.title || "Clase", correct: result.correct, difficulty }, ...old].slice(0, 10));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Error al responder."); }
    finally { setLoading(false); }
  }
  return <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
    <aside className="space-y-5 rounded-3xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 font-semibold"><BookOpen size={18} className="text-primary" /> Configura tu práctica</h2>
      {catalogLoading && <p role="status">Cargando clases publicadas…</p>}
      {!catalogLoading && !lessons.length && <p className="text-sm text-muted-foreground">El docente todavía no publicó clases. Vuelve cuando haya contenido disponible.</p>}
      <label className="block text-sm font-medium">Clase<select className={`${field} mt-2`} value={lessonId} disabled={loading || !lessons.length} onChange={e => { setLessonId(e.target.value); setChallenge(null); setFeedback(null); setError(""); }}>
        {!lessons.length && <option value="">Sin clases publicadas</option>}{lessons.map(l => <option key={l.id} value={l.id}>{l.unit} · {l.title}</option>)}</select></label>
      <label className="block text-sm font-medium">Dificultad<select className={`${field} mt-2`} value={difficulty} disabled={loading} onChange={e => setDifficulty(e.target.value)}><option value="basico">Básico · reconocer</option><option value="intermedio">Intermedio · aplicar</option><option value="avanzado">Avanzado · analizar</option></select></label>
      <button type="button" onClick={generate} disabled={!lessonId || loading} className={`${button} w-full`}><RotateCcw size={17} />{loading ? "Procesando…" : challenge ? "Crear otro ejercicio" : "Crear ejercicio"}</button>
      {loading && <p role="status" className="text-sm text-muted-foreground">La IA está trabajando. La primera consulta puede tardar más mientras carga el modelo.</p>}
      <Link className="block text-sm text-primary underline" href={`/student/courses/${courseId}`}>Volver a estudiar la clase</Link>
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-4"><div><p className="text-2xl font-semibold">{session.attempts}</p><p className="text-xs text-muted-foreground">Intentos</p></div><div><p className="text-2xl font-semibold">{session.correctAnswers}</p><p className="text-xs text-muted-foreground">Aciertos</p></div></div>
    </aside>
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-xl border border-red-500/30 p-4 text-red-500">{error}</p>}
      <article className="rounded-3xl border border-border bg-card p-6 md:p-8">
        {!challenge ? <div className="py-12 text-center"><Sparkles className="mx-auto text-primary" size={32} /><h2 className="mt-4 text-2xl font-semibold">Una nueva oportunidad para aprender</h2><p className="mx-auto mt-3 max-w-md text-muted-foreground">Selecciona una clase y pulsa Crear ejercicio. Después puedes pedir una pista y comprobar tu respuesta.</p></div> : <>
          <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-primary/15 px-3 py-1 text-primary">{challenge.provider === "ollama" ? "IA local" : "IA"}</span><span className="rounded-full bg-secondary px-3 py-1">{challenge.difficulty || difficulty}</span><span className="rounded-full bg-secondary px-3 py-1">{feedback ? "Completado" : "En práctica"}</span></div>
          <h2 className="text-xl font-semibold leading-relaxed">{challenge.question}</h2>
          <fieldset disabled={!!feedback || loading} className="mt-6 space-y-3"><legend className="sr-only">Elige una respuesta</legend>{challenge.options.map((option,index) => <label key={index} className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/10"><input type="radio" className="mt-1 accent-teal-500" name="practice-answer" checked={answer === String(index)} onChange={() => setAnswer(String(index))} /><span>{option}</span></label>)}</fieldset>
          <div className="mt-5 flex flex-wrap gap-3">{!feedback && <button type="button" className={button} disabled={loading || answer === ""} onClick={submit}>Comprobar respuesta</button>}<button type="button" className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm" disabled={loading} onClick={() => setShowHint(v => !v)}><Lightbulb size={17} />{showHint ? "Ocultar pista" : "Dame una pista"}</button></div>
          {showHint && <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm">{challenge.hint}</p>}
          {feedback && <div role="status" className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-5"><h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 size={19} />{feedback.correct ? "¡Bien hecho!" : "Aprender también es volver a intentarlo"}</h3><p className="mt-3 text-sm">Respuesta correcta: {feedback.correctAnswer}</p><p className="mt-3 whitespace-pre-wrap leading-7">{feedback.explanation}</p><button type="button" className={`${button} mt-4`} disabled={loading} onClick={generate}>Practicar con otro ejercicio</button></div>}
        </>}
      </article>
      {lessonId && <CourseTutor key={lessonId} courseId={courseId} lessonId={lessonId} />}
      <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Tus últimas prácticas</h2>{!history.length && <p className="mt-3 text-sm text-muted-foreground">Aquí aparecerán los ejercicios que completes.</p>}<div className="mt-3 space-y-3">{history.map(h => <div key={h.id} className="rounded-xl border border-border p-3"><p className="text-xs text-primary">{h.topic} · {h.correct ? "Correcto" : "Por reforzar"}</p><p className="mt-1 text-sm">{h.question}</p></div>)}</div></section>
    </div>
  </div>;
}
function SubjectButton({ id, selected, onSelect }: { id: string; selected: boolean; onSelect: () => void }) {
  const { data } = useLiveCourse(id);
  return <button type="button" aria-pressed={selected} onClick={onSelect} className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium aria-pressed:border-primary aria-pressed:bg-primary/15 aria-pressed:text-primary">{data[0]?.name || "Cargando materia…"}</button>;
}
