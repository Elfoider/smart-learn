"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Flag,
  LayoutGrid,
  LoaderCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import type {
  ExamAnswer,
  ExamOption,
  ExamQuestion,
  StudentExam,
} from "@/data/exams";
import { cn } from "@/lib/utils/cn";

interface GraphicalExamProps {
  exam: StudentExam;
}

type ExamPhase =
  | "introduction"
  | "active"
  | "submitted";

interface ExamResult {
  score: number;
  earnedPoints: number;
  totalPoints: number;
  correctAnswers: number;
  answeredQuestions: number;
  passed: boolean;
}

function answersMatch(
  received: ExamAnswer | undefined,
  expected: ExamAnswer,
) {
  if (
    Array.isArray(received) &&
    Array.isArray(expected)
  ) {
    return (
      received.length ===
        expected.length &&
      received.every(
        (value, index) =>
          value === expected[index],
      )
    );
  }

  return received === expected;
}

function calculateResult(
  exam: StudentExam,
  answers: Record<
    string,
    ExamAnswer
  >,
): ExamResult {
  const totalPoints =
    exam.questions.reduce(
      (total, question) =>
        total + question.points,
      0,
    );

  let earnedPoints = 0;
  let correctAnswers = 0;
  let answeredQuestions = 0;

  exam.questions.forEach(
    (question) => {
      const answer =
        answers[question.id];

      const answered =
        typeof answer === "string"
          ? answer.trim().length > 0
          : Array.isArray(answer) &&
            answer.length > 0;

      if (answered) {
        answeredQuestions += 1;
      }

      if (
        answersMatch(
          answer,
          question.correctAnswer,
        )
      ) {
        earnedPoints +=
          question.points;

        correctAnswers += 1;
      }
    },
  );

  const score =
    totalPoints > 0
      ? Math.round(
          (earnedPoints /
            totalPoints) *
            100,
        )
      : 0;

  return {
    score,
    earnedPoints,
    totalPoints,
    correctAnswers,
    answeredQuestions,
    passed:
      score >= exam.passingScore,
  };
}

function isQuestionAnswered(
  answer: ExamAnswer | undefined,
) {
  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  return (
    Array.isArray(answer) &&
    answer.length > 0
  );
}

function formatTime(
  totalSeconds: number,
) {
  const minutes = Math.floor(
    totalSeconds / 60,
  );

  const seconds =
    totalSeconds % 60;

  return `${minutes
    .toString()
    .padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function GraphicalExam({
  exam,
}: GraphicalExamProps) {
  const [phase, setPhase] =
    useState<ExamPhase>(
      "introduction",
    );

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<
      Record<string, ExamAnswer>
    >({});

  const [flaggedIds, setFlaggedIds] =
    useState<string[]>([]);

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      exam.durationMinutes * 60,
    );

  const [result, setResult] =
    useState<ExamResult | null>(
      null,
    );

  const [submitting, setSubmitting] =
    useState(false);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const currentQuestion =
    exam.questions[currentIndex];

  const answeredCount =
    exam.questions.filter(
      (question) =>
        isQuestionAnswered(
          answers[question.id],
        ),
    ).length;

  const progress =
    exam.questions.length > 0
      ? Math.round(
          (answeredCount /
            exam.questions.length) *
            100,
        )
      : 0;

  useEffect(() => {
    if (phase !== "active") {
      return;
    }

    const interval =
      window.setInterval(() => {
        setRemainingSeconds(
          (current) => {
            if (current <= 1) {
              window.clearInterval(
                interval,
              );

              const automaticResult =
                calculateResult(
                  exam,
                  answersRef.current,
                );

              setResult(
                automaticResult,
              );

              setPhase(
                "submitted",
              );

              toast.info(
                "El tiempo finalizó",
                {
                  description:
                    "La evaluación fue entregada automáticamente.",
                },
              );

              return 0;
            }

            return current - 1;
          },
        );
      }, 1000);

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [exam, phase]);

  function startExam() {
    setAnswers({});
    setFlaggedIds([]);
    setCurrentIndex(0);
    setRemainingSeconds(
      exam.durationMinutes * 60,
    );
    setResult(null);
    setPhase("active");
  }

  function updateAnswer(
    questionId: string,
    answer: ExamAnswer,
  ) {
    setAnswers((current) => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function toggleFlag(
    questionId: string,
  ) {
    setFlaggedIds((current) =>
      current.includes(questionId)
        ? current.filter(
            (id) =>
              id !== questionId,
          )
        : [
            ...current,
            questionId,
          ],
    );
  }

  function selectQuestion(
    index: number,
  ) {
    setCurrentIndex(index);
  }

  function submitExam() {
    const unanswered =
      exam.questions.length -
      answeredCount;

    if (unanswered > 0) {
      const confirmed =
        window.confirm(
          `Todavía tienes ${unanswered} pregunta(s) sin responder. ¿Deseas entregar la evaluación?`,
        );

      if (!confirmed) {
        return;
      }
    }

    setSubmitting(true);

    window.setTimeout(() => {
      const nextResult =
        calculateResult(
          exam,
          answersRef.current,
        );

      setResult(nextResult);
      setPhase("submitted");
      setSubmitting(false);
    }, 550);
  }

  if (
    phase === "introduction"
  ) {
    return (
      <ExamIntroduction
        exam={exam}
        onStart={startExam}
      />
    );
  }

  if (
    phase === "submitted" &&
    result
  ) {
    return (
      <ExamResultScreen
        exam={exam}
        result={result}
        answers={answers}
        onRetry={startExam}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="sticky top-[4.5rem] z-20 overflow-hidden rounded-[1.6rem] border border-border bg-card/90 shadow-lg backdrop-blur-2xl">
        <div className="flex flex-wrap items-center gap-4 px-4 py-4 sm:px-5">
          <Link
            href="/student/exams"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background/60 text-muted-foreground"
            aria-label="Salir de la evaluación"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary">
              {exam.courseCode}
            </p>

            <h1 className="mt-1 truncate text-sm font-semibold sm:text-base">
              {exam.title}
            </h1>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold",
              remainingSeconds <= 60
                ? "border-danger/30 bg-danger/10 text-danger"
                : "border-primary/20 bg-secondary text-secondary-foreground",
            )}
          >
            <Timer
              aria-hidden="true"
              className="h-4 w-4"
            />

            {formatTime(
              remainingSeconds,
            )}
          </div>

          <div className="hidden min-w-40 sm:block">
            <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
              <span>Respondidas</span>
              <span>
                {answeredCount}/
                {exam.questions.length}
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-[#756fff] transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <main className="min-w-0 overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm backdrop-blur-xl">
          <div className="border-b border-border px-5 py-5 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-[0.68rem] font-semibold text-secondary-foreground">
                    Pregunta{" "}
                    {currentIndex + 1} de{" "}
                    {exam.questions.length}
                  </span>

                  <span className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-[0.68rem] font-semibold text-muted-foreground">
                    {
                      currentQuestion.points
                    }{" "}
                    puntos
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                  {
                    currentQuestion.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  toggleFlag(
                    currentQuestion.id,
                  );
                }}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-semibold transition-all",
                  flaggedIds.includes(
                    currentQuestion.id,
                  )
                    ? "border-[#e0ae43]/30 bg-[#fff3cf] text-[#765008] dark:bg-[#443215] dark:text-[#ffda8d]"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                <Flag
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4",
                    flaggedIds.includes(
                      currentQuestion.id,
                    ) &&
                      "fill-current",
                  )}
                />

                {flaggedIds.includes(
                  currentQuestion.id,
                )
                  ? "Marcada"
                  : "Revisar después"}
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="relative overflow-hidden rounded-[1.7rem] bg-[#071a22] p-5 text-white sm:p-7">
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(46,222,200,0.22),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(118,105,255,0.22),transparent_35%)]"
              />

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#62ead8]">
                  Planteamiento
                </p>

                <p className="mt-4 max-w-4xl text-lg font-medium leading-8 sm:text-xl">
                  {
                    currentQuestion.prompt
                  }
                </p>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm text-white/60">
                  <Sparkles
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#62ead8]"
                  />

                  {
                    currentQuestion.instruction
                  }
                </div>
              </div>
            </div>

            <div className="mt-6">
              <QuestionInput
                question={currentQuestion}
                answer={
                  answers[
                    currentQuestion.id
                  ]
                }
                onChange={(answer) => {
                  updateAnswer(
                    currentQuestion.id,
                    answer,
                  );
                }}
              />
            </div>
          </div>

          <footer className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(
                  (current) =>
                    Math.max(
                      current - 1,
                      0,
                    ),
                );
              }}
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-5 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-4 w-4"
              />

              Anterior
            </button>

            {currentIndex <
            exam.questions.length -
              1 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(
                    (current) =>
                      Math.min(
                        current + 1,
                        exam.questions
                          .length - 1,
                      ),
                  );
                }}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5"
              >
                Siguiente pregunta

                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={submitExam}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
              >
                {submitting ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Send
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                )}

                Entregar evaluación
              </button>
            )}
          </footer>
        </main>

        <aside className="space-y-5">
          <section className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <LayoutGrid
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Navegación
                </p>

                <h3 className="mt-1 text-sm font-semibold">
                  Preguntas
                </h3>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 xl:grid-cols-4">
              {exam.questions.map(
                (question, index) => {
                  const active =
                    index ===
                    currentIndex;

                  const answered =
                    isQuestionAnswered(
                      answers[
                        question.id
                      ],
                    );

                  const flagged =
                    flaggedIds.includes(
                      question.id,
                    );

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => {
                        selectQuestion(
                          index,
                        );
                      }}
                      className={cn(
                        "relative flex aspect-square items-center justify-center rounded-xl border text-xs font-bold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                          : answered
                            ? "border-primary/20 bg-secondary text-secondary-foreground"
                            : "border-border bg-background/60 text-muted-foreground hover:border-primary/30",
                      )}
                    >
                      {answered &&
                      !active ? (
                        <Check
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      ) : (
                        index + 1
                      )}

                      {flagged && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e2a92d] text-white ring-2 ring-card">
                          <Flag
                            aria-hidden="true"
                            className="h-2.5 w-2.5 fill-current"
                          />
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>

            <div className="mt-5 space-y-2 text-[0.68rem] text-muted-foreground">
              <LegendItem
                surface="bg-primary"
                label="Pregunta actual"
              />

              <LegendItem
                surface="bg-secondary border border-primary/20"
                label="Respondida"
              />

              <LegendItem
                surface="bg-background border border-border"
                label="Sin responder"
              />
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-primary/15 bg-secondary p-5">
            <div className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              />

              <div>
                <h3 className="text-sm font-semibold text-secondary-foreground">
                  Guardado del prototipo
                </h3>

                <p className="mt-2 text-xs leading-6 text-secondary-foreground/70">
                  En este bloque las
                  respuestas se conservan
                  mientras permanezcas en la
                  pantalla. En el próximo se
                  sincronizarán con Firestore.
                </p>
              </div>
            </div>
          </section>

          <button
            type="button"
            disabled={submitting}
            onClick={submitExam}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
          >
            <Send
              aria-hidden="true"
              className="h-4 w-4"
            />

            Entregar evaluación
          </button>
        </aside>
      </section>
    </div>
  );
}

interface QuestionInputProps {
  question: ExamQuestion;
  answer: ExamAnswer | undefined;
  onChange: (
    answer: ExamAnswer,
  ) => void;
}

function QuestionInput({
  question,
  answer,
  onChange,
}: QuestionInputProps) {
  if (
    question.type === "ordering"
  ) {
    return (
      <OrderingQuestion
        items={
          question.orderingItems ??
          []
        }
        answer={
          Array.isArray(answer)
            ? answer
            : []
        }
        onChange={onChange}
      />
    );
  }

  const visual =
    question.type ===
    "visual-choice";

  return (
    <div
      className={cn(
        "grid gap-3",
        visual &&
          "md:grid-cols-3",
      )}
    >
      {question.options?.map(
        (option, index) => {
          const selected =
            answer === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
              }}
              className={cn(
                "group flex min-h-16 items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                visual &&
                  "min-h-52 flex-col items-stretch justify-between p-5",
                selected
                  ? "border-primary bg-secondary text-secondary-foreground shadow-lg shadow-primary/10"
                  : "border-border bg-background/60 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                  visual &&
                    "h-20 w-full rounded-2xl text-lg",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {option.symbol ??
                  String.fromCharCode(
                    65 + index,
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {option.label}
                </p>

                {option.description && (
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {
                      option.description
                    }
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-transparent",
                )}
              >
                <Check
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </div>
            </button>
          );
        },
      )}
    </div>
  );
}

interface OrderingQuestionProps {
  items: ExamOption[];
  answer: string[];
  onChange: (
    answer: ExamAnswer,
  ) => void;
}

function OrderingQuestion({
  items,
  answer,
  onChange,
}: OrderingQuestionProps) {
  const selectedItems =
    answer
      .map((id) =>
        items.find(
          (item) =>
            item.id === id,
        ),
      )
      .filter(
        (
          item,
        ): item is ExamOption =>
          Boolean(item),
      );

  const availableItems =
    items.filter(
      (item) =>
        !answer.includes(item.id),
    );

  function selectItem(
    itemId: string,
  ) {
    onChange([
      ...answer,
      itemId,
    ]);
  }

  function removeItem(
    itemId: string,
  ) {
    onChange(
      answer.filter(
        (id) => id !== itemId,
      ),
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-primary/20 bg-secondary p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground/65">
          Orden seleccionado
        </p>

        {selectedItems.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {selectedItems.map(
              (item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    removeItem(
                      item.id,
                    );
                  }}
                  className="flex min-h-14 items-center gap-4 rounded-2xl border border-primary/20 bg-background/65 p-3 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {item.label}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Presiona para quitar
                    </p>
                  </div>

                  <XCircle
                    aria-hidden="true"
                    className="h-5 w-5 text-muted-foreground"
                  />
                </button>
              ),
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-secondary-foreground/70">
            Selecciona las etapas en el
            orden correcto.
          </p>
        )}
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Elementos disponibles
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {availableItems.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectItem(item.id);
                }}
                className="flex min-h-20 items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground">
                  +
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {
                      item.description
                    }
                  </p>
                </div>
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

interface ExamIntroductionProps {
  exam: StudentExam;
  onStart: () => void;
}

function ExamIntroduction({
  exam,
  onStart,
}: ExamIntroductionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8 lg:p-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,222,199,0.25),transparent_34%),radial-gradient(circle_at_88%_88%,rgba(117,104,255,0.25),transparent_36%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <Link
          href="/student/exams"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-semibold text-white/70 backdrop-blur-xl"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />

          Regresar
        </Link>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#62ead8]">
              <ClipboardCheck
                aria-hidden="true"
                className="h-4 w-4"
              />

              {exam.courseCode}
            </div>

            <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              {exam.title}
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              {exam.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <IntroBadge
                icon={Clock3}
                text={`${exam.durationMinutes} minutos`}
              />

              <IntroBadge
                icon={Target}
                text={`${exam.questions.length} preguntas`}
              />

              <IntroBadge
                icon={Award}
                text={`Aprobación: ${exam.passingScore}%`}
              />
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl sm:p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#59e4d2] text-[#05231f]">
              <ShieldCheck
                aria-hidden="true"
                className="h-6 w-6"
              />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Antes de comenzar
            </h2>

            <div className="mt-5 space-y-3">
              {[
                "El temporizador comienza al presionar el botón.",
                "Puedes navegar libremente entre las preguntas.",
                "Marca preguntas para revisarlas antes de entregar.",
                "Al terminar el tiempo, la evaluación se entrega automáticamente.",
              ].map(
                (instruction) => (
                  <div
                    key={instruction}
                    className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-3"
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#59e4d2]"
                    />

                    <p className="text-xs leading-6 text-white/65">
                      {instruction}
                    </p>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={onStart}
              className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/20 transition-all hover:-translate-y-0.5"
            >
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4"
              />

              Comenzar evaluación
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ExamResultScreenProps {
  exam: StudentExam;
  result: ExamResult;
  answers: Record<
    string,
    ExamAnswer
  >;
  onRetry: () => void;
}

function ExamResultScreen({
  exam,
  result,
  answers,
  onRetry,
}: ExamResultScreenProps) {
  return (
    <div className="space-y-6">
      <section
        className={cn(
          "relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl sm:p-8 lg:p-10",
          result.passed
            ? "bg-[#071a22]"
            : "bg-[#28171a]",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            result.passed
              ? "bg-[radial-gradient(circle_at_15%_15%,rgba(44,222,199,0.25),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(116,103,255,0.24),transparent_35%)]"
              : "bg-[radial-gradient(circle_at_15%_15%,rgba(255,103,109,0.23),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(255,190,92,0.16),transparent_35%)]",
          )}
        />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem]",
              result.passed
                ? "bg-[#59e4d2] text-[#05231f]"
                : "bg-danger text-white",
            )}
          >
            {result.passed ? (
              <Trophy
                aria-hidden="true"
                className="h-9 w-9"
              />
            ) : (
              <AlertTriangle
                aria-hidden="true"
                className="h-9 w-9"
              />
            )}
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            Resultado de la evaluación
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
            {result.score}%
          </h1>

          <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
            {result.passed
              ? "Evaluación aprobada"
              : "Necesitas reforzar algunos temas"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Obtuviste{" "}
            {result.earnedPoints} de{" "}
            {result.totalPoints} puntos y
            respondiste correctamente{" "}
            {result.correctAnswers} de{" "}
            {exam.questions.length} preguntas.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/student/exams"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-4 w-4"
              />

              Volver a evaluaciones
            </Link>

            {exam.attemptsAllowed >
              1 && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f]"
              >
                <RotateCcw
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Realizar otro intento
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <ResultMetric
          icon={Target}
          value={`${result.score}%`}
          label="Calificación"
        />

        <ResultMetric
          icon={CheckCircle2}
          value={`${result.correctAnswers}/${exam.questions.length}`}
          label="Aciertos"
        />

        <ResultMetric
          icon={ClipboardCheck}
          value={`${result.answeredQuestions}/${exam.questions.length}`}
          label="Respondidas"
        />

        <ResultMetric
          icon={Award}
          value={`${exam.weight}%`}
          label="Ponderación"
        />
      </section>

      <section className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Revisión
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            Resumen de respuestas
          </h2>
        </div>

        <div className="mt-6 grid gap-3">
          {exam.questions.map(
            (question, index) => {
              const correct =
                answersMatch(
                  answers[question.id],
                  question.correctAnswer,
                );

              return (
                <article
                  key={question.id}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      correct
                        ? "bg-primary text-primary-foreground"
                        : "bg-danger text-white",
                    )}
                  >
                    {correct ? (
                      <Check
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    ) : (
                      <XCircle
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-primary">
                      Pregunta {index + 1}
                    </p>

                    <h3 className="mt-1 text-sm font-semibold">
                      {question.title}
                    </h3>

                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {
                        question.explanation
                      }
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-xs font-semibold",
                      correct
                        ? "text-primary"
                        : "text-danger",
                    )}
                  >
                    {correct
                      ? `+${question.points}`
                      : "0"}{" "}
                    pts
                  </span>
                </article>
              );
            },
          )}
        </div>
      </section>
    </div>
  );
}

interface IntroBadgeProps {
  icon: typeof Clock3;
  text: string;
}

function IntroBadge({
  icon: Icon,
  text,
}: IntroBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur-xl">
      <Icon
        aria-hidden="true"
        className="h-4 w-4 text-[#59e4d2]"
      />

      {text}
    </div>
  );
}

interface LegendItemProps {
  surface: string;
  label: string;
}

function LegendItem({
  surface,
  label,
}: LegendItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-3 w-3 rounded",
          surface,
        )}
      />

      {label}
    </div>
  );
}

interface ResultMetricProps {
  icon: typeof Target;
  value: string;
  label: string;
}

function ResultMetric({
  icon: Icon,
  value,
  label,
}: ResultMetricProps) {
  return (
    <article className="rounded-[1.6rem] border border-border bg-card/75 p-5 text-center shadow-sm">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {label}
      </p>
    </article>
  );
}