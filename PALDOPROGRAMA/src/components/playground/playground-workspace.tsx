"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  Flame,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  RefreshCcw,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import {
  evaluatePlaygroundAnswer,
  playgroundCourses,
  type PlaygroundCourse,
  type PlaygroundExercise,
  type PlaygroundTopic,
} from "@/data/playground";
import { usePlaygroundSession } from "@/hooks/use-playground-session";
import { SmartTutorPanel } from "@/components/playground/smart-tutor-panel";
import { cn } from "@/lib/utils/cn";

const courseIcons: Record<string, LucideIcon> = {
  "programacion-web": BookOpen,
  "base-datos": Database,
  "inteligencia-artificial": BrainCircuit,
};

const toneClasses: Record<
  PlaygroundCourse["tone"],
  {
    selected: string;
    icon: string;
  }
> = {
  teal: {
    selected: "border-[#30d8c3]/40 bg-[#143e3d] text-white",
    icon: "bg-[#4ce5d2] text-[#062521]",
  },
  violet: {
    selected: "border-[#a38cff]/40 bg-[#31295a] text-white",
    icon: "bg-[#b8a7ff] text-[#261d4c]",
  },
  amber: {
    selected: "border-[#ffc96f]/40 bg-[#553a18] text-white",
    icon: "bg-[#ffd583] text-[#432904]",
  },
};

export function PlaygroundWorkspace() {
  const initialCourse = playgroundCourses[0];

  const [selectedCourseId, setSelectedCourseId] = useState(initialCourse.id);

  const [selectedTopicId, setSelectedTopicId] = useState(
    initialCourse.topics[0].id,
  );

  const selectedCourse =
    playgroundCourses.find((course) => course.id === selectedCourseId) ??
    initialCourse;

  const selectedTopic =
    selectedCourse.topics.find((topic) => topic.id === selectedTopicId) ??
    selectedCourse.topics[0];

  function handleCourseChange(courseId: string) {
    const course = playgroundCourses.find((item) => item.id === courseId);

    if (!course) {
      return;
    }

    setSelectedCourseId(course.id);
    setSelectedTopicId(course.topics[0].id);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(44,221,198,0.24),transparent_33%),radial-gradient(circle_at_88%_88%,rgba(119,104,255,0.23),transparent_35%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#64ead8]">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              Práctica inteligente
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Playground académico
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Resuelve ejercicios, solicita pistas y recibe retroalimentación
              inmediata sobre los temas de tus materias.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
              <Target
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-[#57e5d2]"
              />

              <p className="mt-2 text-lg font-semibold">3</p>

              <p className="text-[0.68rem] text-white/45">Materias</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
              <Trophy
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-[#c1b3ff]"
              />

              <p className="mt-2 text-lg font-semibold">9</p>

              <p className="text-[0.68rem] text-white/45">Ejercicios</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
              <Bot
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-[#ffd27d]"
              />

              <p className="mt-2 text-lg font-semibold">IA</p>

              <p className="text-[0.68rem] text-white/45">Asistencia</p>
            </div>
          </div>
        </div>
      </section>

      <PlaygroundSessionArea
        key={`${selectedCourse.id}-${selectedTopic.id}`}
        selectedCourse={selectedCourse}
        selectedTopic={selectedTopic}
        selectedCourseId={selectedCourseId}
        selectedTopicId={selectedTopicId}
        onCourseChange={handleCourseChange}
        onTopicChange={setSelectedTopicId}
      />
    </div>
  );
}

interface PlaygroundSessionAreaProps {
  selectedCourse: PlaygroundCourse;
  selectedTopic: PlaygroundTopic;
  selectedCourseId: string;
  selectedTopicId: string;
  onCourseChange: (courseId: string) => void;
  onTopicChange: (topicId: string) => void;
}

function PlaygroundSessionArea({
  selectedCourse,
  selectedTopic,
  selectedCourseId,
  selectedTopicId,
  onCourseChange,
  onTopicChange,
}: PlaygroundSessionAreaProps) {
  const {
    session,
    loading,
    saving,
    openExercise,
    recordAttempt,
    resetSession,
  } = usePlaygroundSession({
    courseId: selectedCourse.id,
    topicId: selectedTopic.id,
    initialExerciseId: selectedTopic.exercises[0].id,
  });

  const currentExercise =
    selectedTopic.exercises.find(
      (exercise) => exercise.id === session.currentExerciseId,
    ) ?? selectedTopic.exercises[0];

  const completedCount = selectedTopic.exercises.filter((exercise) =>
    session.completedExerciseIds.includes(exercise.id),
  ).length;

  const progress = Math.round(
    (completedCount / selectedTopic.exercises.length) * 100,
  );

  const accuracy =
    session.attempts > 0
      ? Math.round((session.correctAnswers / session.attempts) * 100)
      : 0;

  return (
    <section className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
      <aside className="rounded-[1.8rem] border border-border bg-card/75 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <GraduationCap aria-hidden="true" className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Configuración
            </p>

            <h2 className="mt-1 text-sm font-semibold">Elige qué practicar</h2>
          </div>
        </div>

        <p className="mt-5 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Materia
        </p>

        <div className="mt-3 space-y-2">
          {playgroundCourses.map((course) => {
            const Icon = courseIcons[course.id] ?? BookOpen;

            const selected = course.id === selectedCourseId;

            const tone = toneClasses[course.tone];

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => {
                  onCourseChange(course.id);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  selected
                    ? tone.selected
                    : "border-border bg-background/55 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    selected
                      ? tone.icon
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {course.code}
                  </p>

                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-[0.68rem]",
                      selected ? "text-white/55" : "text-muted-foreground",
                    )}
                  >
                    {course.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tema
        </p>

        <div className="mt-3 space-y-2">
          {selectedCourse.topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => {
                onTopicChange(topic.id);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-xs font-semibold transition-all",
                topic.id === selectedTopicId
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-border bg-background/55 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              <span>{topic.title}</span>

              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>

            <span className="font-semibold text-primary">{progress}%</span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-[#756fff] transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="mt-3 text-[0.68rem] text-muted-foreground">
            {completedCount} de {selectedTopic.exercises.length} ejercicios
            completados
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            void resetSession();
          }}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/55 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reiniciar práctica
        </button>
      </aside>

      <main className="min-w-0">
        {loading ? (
          <div className="flex min-h-[42rem] items-center justify-center rounded-[2rem] border border-border bg-card/75">
            <div className="text-center">
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto h-8 w-8 animate-spin text-primary"
              />

              <p className="mt-4 text-sm font-semibold">Preparando práctica</p>

              <p className="mt-2 text-xs text-muted-foreground">
                Sincronizando tu sesión.
              </p>
            </div>
          </div>
        ) : (
          <ExerciseWorkspace
            key={currentExercise.id}
            exercise={currentExercise}
            exercises={selectedTopic.exercises}
            completedExerciseIds={session.completedExerciseIds}
            saving={saving}
            onOpenExercise={openExercise}
            onRecordAttempt={recordAttempt}
          />
        )}
      </main>

      <aside className="space-y-5">
        <SmartTutorPanel
          course={selectedCourse}
          topic={selectedTopic}
          exercise={currentExercise}
        />

        <section className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Rendimiento
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <Flame
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-primary"
              />

              <p className="mt-2 text-xl font-semibold">{session.attempts}</p>

              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                Intentos
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <Target
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-primary"
              />

              <p className="mt-2 text-xl font-semibold">{accuracy}%</p>

              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                Precisión
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-primary"
              />

              <p className="mt-2 text-xl font-semibold">{completedCount}</p>

              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                Completados
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <CircleHelp
                aria-hidden="true"
                className="mx-auto h-5 w-5 text-primary"
              />

              <p className="mt-2 text-xl font-semibold">
                {session.totalHintsUsed}
              </p>

              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                Pistas
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            El progreso se guarda automáticamente.
          </div>
        </section>
      </aside>
    </section>
  );
}

interface ExerciseWorkspaceProps {
  exercise: PlaygroundExercise;
  exercises: PlaygroundExercise[];
  completedExerciseIds: string[];
  saving: boolean;
  onOpenExercise: (exerciseId: string) => Promise<void>;
  onRecordAttempt: (
    exerciseId: string,
    correct: boolean,
    hintsUsed: number,
  ) => Promise<void>;
}

function ExerciseWorkspace({
  exercise,
  exercises,
  completedExerciseIds,
  saving,
  onOpenExercise,
  onRecordAttempt,
}: ExerciseWorkspaceProps) {
  const [answer, setAnswer] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const [correct, setCorrect] = useState(false);

  const [revealedHints, setRevealedHints] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const currentIndex = exercises.findIndex((item) => item.id === exercise.id);

  const nextExercise =
    currentIndex < exercises.length - 1 ? exercises[currentIndex + 1] : null;

  const alreadyCompleted = completedExerciseIds.includes(exercise.id);

  const canSubmit = answer.trim().length > 0 && !submitting && !saving;

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const result = evaluatePlaygroundAnswer(exercise, answer);

    setSubmitting(true);
    setSubmitted(true);
    setCorrect(result);

    try {
      await onRecordAttempt(exercise.id, result, revealedHints);
    } finally {
      setSubmitting(false);
    }
  }

  function retryExercise() {
    setAnswer("");
    setSubmitted(false);
    setCorrect(false);
    setRevealedHints(0);
  }

  async function goToNextExercise() {
    if (!nextExercise) {
      return;
    }

    await onOpenExercise(nextExercise.id);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm backdrop-blur-xl">
      <div className="border-b border-border px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-[0.68rem] font-semibold text-secondary-foreground">
                Ejercicio {currentIndex + 1} de {exercises.length}
              </span>

              <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-[0.68rem] font-semibold text-muted-foreground">
                {exercise.difficulty}
              </span>

              {alreadyCompleted && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary px-3 py-1.5 text-[0.68rem] font-semibold text-primary-foreground">
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Completado
                </span>
              )}
            </div>

            <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
              {exercise.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {exercises.map((item, index) => {
              const completed = completedExerciseIds.includes(item.id);

              const active = item.id === exercise.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void onOpenExercise(item.id);
                  }}
                  aria-label={`Abrir ejercicio ${index + 1}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : completed
                        ? "border-primary/20 bg-secondary text-secondary-foreground"
                        : "border-border bg-background/60 text-muted-foreground",
                  )}
                >
                  {completed ? (
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="rounded-[1.6rem] border border-border bg-background/60 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Planteamiento
          </p>

          <p className="mt-4 text-base font-medium leading-8 sm:text-lg">
            {exercise.prompt}
          </p>
        </div>

        <div className="mt-6">
          <ExerciseAnswerInput
            exercise={exercise}
            answer={answer}
            disabled={submitted}
            onAnswerChange={setAnswer}
          />
        </div>

        {revealedHints > 0 && (
          <div className="mt-6 space-y-3">
            {exercise.hints.slice(0, revealedHints).map((hint, index) => (
              <div
                key={hint}
                className="flex gap-3 rounded-2xl border border-[#e0b04b]/25 bg-[#fff5d9] p-4 text-[#6d4b08] dark:bg-[#423115] dark:text-[#ffd98c]"
              >
                <Lightbulb
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0"
                />

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em]">
                    Pista {index + 1}
                  </p>

                  <p className="mt-2 text-sm leading-6">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {submitted && (
          <div
            className={cn(
              "mt-6 rounded-[1.5rem] border p-5",
              correct
                ? "border-primary/25 bg-secondary"
                : "border-danger/25 bg-danger/5",
            )}
          >
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  correct
                    ? "bg-primary text-primary-foreground"
                    : "bg-danger text-white",
                )}
              >
                {correct ? (
                  <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <XCircle aria-hidden="true" className="h-5 w-5" />
                )}
              </div>

              <div>
                <h3
                  className={cn(
                    "text-base font-semibold",
                    correct ? "text-secondary-foreground" : "text-foreground",
                  )}
                >
                  {correct ? "Respuesta correcta" : "Revisa tu respuesta"}
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {exercise.explanation}
                </p>

                {!correct && (
                  <p className="mt-3 text-sm font-semibold text-danger">
                    Respuesta esperada: {exercise.correctAnswer}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={submitted || revealedHints >= exercise.hints.length}
            onClick={() => {
              setRevealedHints((current) =>
                Math.min(current + 1, exercise.hints.length),
              );
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <CircleHelp aria-hidden="true" className="h-4 w-4" />
            Solicitar pista
          </button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {submitted && !correct && (
              <button
                type="button"
                onClick={retryExercise}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-5 text-sm font-semibold"
              >
                <RefreshCcw aria-hidden="true" className="h-4 w-4" />
                Intentar nuevamente
              </button>
            )}

            {submitted && correct ? (
              <button
                type="button"
                disabled={!nextExercise}
                onClick={() => {
                  void goToNextExercise();
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
              >
                {nextExercise ? "Siguiente ejercicio" : "Tema completado"}

                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => {
                  void handleSubmit();
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                    Evaluando
                  </>
                ) : (
                  <>
                    <Send aria-hidden="true" className="h-4 w-4" />
                    Comprobar respuesta
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExerciseAnswerInputProps {
  exercise: PlaygroundExercise;
  answer: string;
  disabled: boolean;
  onAnswerChange: (value: string) => void;
}

function ExerciseAnswerInput({
  exercise,
  answer,
  disabled,
  onAnswerChange,
}: ExerciseAnswerInputProps) {
  if (exercise.type === "multiple-choice" || exercise.type === "true-false") {
    return (
      <div className="grid gap-3">
        {exercise.options?.map((option, index) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => {
              onAnswerChange(option);
            }}
            className={cn(
              "flex min-h-14 items-center gap-4 rounded-2xl border p-4 text-left text-sm font-medium transition-all disabled:pointer-events-none",
              answer === option
                ? "border-primary bg-secondary text-secondary-foreground shadow-md"
                : "border-border bg-background/60 text-foreground hover:border-primary/30",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                answer === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {String.fromCharCode(65 + index)}
            </div>

            <span>{option}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={`answer-${exercise.id}`}
        className="mb-2 block text-sm font-semibold"
      >
        Tu respuesta
      </label>

      <textarea
        id={`answer-${exercise.id}`}
        value={answer}
        disabled={disabled}
        onChange={(event) => {
          onAnswerChange(event.target.value);
        }}
        placeholder="Escribe tu respuesta..."
        className="min-h-36 w-full resize-y rounded-2xl border border-border bg-background/60 p-4 text-sm leading-7 outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:opacity-70"
      />

      <p className="mt-2 text-xs text-muted-foreground">
        No es necesario utilizar mayúsculas ni tildes exactas.
      </p>
    </div>
  );
}
