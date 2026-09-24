"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LockKeyhole,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import {
  studentExams,
  type ExamStatus,
  type ExamTone,
} from "@/data/exams";
import { cn } from "@/lib/utils/cn";

const statusLabels: Record<
  ExamStatus,
  string
> = {
  available: "Disponibles",
  upcoming: "Próximas",
  completed: "Completadas",
};

const toneStyles: Record<
  ExamTone,
  {
    background: string;
    icon: string;
    glow: string;
  }
> = {
  teal: {
    background:
      "from-[#073c42] via-[#0c5559] to-[#13736e]",
    icon:
      "bg-[#59e6d4] text-[#062420]",
    glow: "bg-[#45e0cd]/25",
  },
  violet: {
    background:
      "from-[#30275e] via-[#46377c] to-[#604a9e]",
    icon:
      "bg-[#bcaeff] text-[#251c4b]",
    glow: "bg-[#a38cff]/25",
  },
  amber: {
    background:
      "from-[#5c3b14] via-[#7c511c] to-[#9e6c27]",
    icon:
      "bg-[#ffd581] text-[#432904]",
    glow: "bg-[#ffc760]/25",
  },
};

const statusIcons: Record<
  ExamStatus,
  LucideIcon
> = {
  available: ClipboardCheck,
  upcoming: CalendarClock,
  completed: Trophy,
};

type StatusFilter =
  | "all"
  | ExamStatus;

export function ExamCatalog() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const filteredExams = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return studentExams.filter(
      (exam) => {
        const matchesSearch =
          !normalizedSearch ||
          exam.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          exam.courseTitle
            .toLowerCase()
            .includes(normalizedSearch) ||
          exam.courseCode
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          status === "all" ||
          exam.status === status;

        return (
          matchesSearch &&
          matchesStatus
        );
      },
    );
  }, [search, status]);

  const availableCount =
    studentExams.filter(
      (exam) =>
        exam.status === "available",
    ).length;

  const completedCount =
    studentExams.filter(
      (exam) =>
        exam.status === "completed",
    ).length;

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,222,199,0.24),transparent_33%),radial-gradient(circle_at_88%_88%,rgba(117,104,255,0.24),transparent_35%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#62ead8]">
              <ClipboardCheck
                aria-hidden="true"
                className="h-4 w-4"
              />

              Centro de evaluaciones
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Demuestra lo que aprendiste.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Revisa las evaluaciones de tus
              materias, completa las actividades
              disponibles y consulta tus resultados.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              icon={Target}
              value={availableCount}
              label="Disponibles"
            />

            <MetricCard
              icon={CheckCircle2}
              value={completedCount}
              label="Completadas"
            />

            <MetricCard
              icon={Trophy}
              value="84%"
              label="Mejor nota"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-[1.7rem] border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xl lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value,
              );
            }}
            placeholder="Buscar evaluación o materia"
            className="h-12 w-full rounded-2xl border border-border bg-background/70 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <SlidersHorizontal
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          {(
            [
              "all",
              "available",
              "upcoming",
              "completed",
            ] as const
          ).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setStatus(item);
              }}
              className={cn(
                "min-h-11 shrink-0 rounded-2xl border px-4 text-xs font-semibold transition-all",
                status === item
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-border bg-background/65 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {item === "all"
                ? "Todas"
                : statusLabels[item]}
            </button>
          ))}
        </div>
      </section>

      {filteredExams.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-2">
          {filteredExams.map(
            (exam) => {
              const tone =
                toneStyles[exam.tone];

              const StatusIcon =
                statusIcons[
                  exam.status
                ];

              const available =
                exam.status ===
                "available";

              return (
                <article
                  key={exam.id}
                  className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-7",
                      tone.background,
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        "absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl",
                        tone.glow,
                      )}
                    />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg",
                            tone.icon,
                          )}
                        >
                          <StatusIcon
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        </div>

                        <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-semibold text-white/75 backdrop-blur-xl">
                          {exam.courseCode}
                        </span>
                      </div>

                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                        {exam.courseTitle}
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                        {exam.title}
                      </h2>

                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                        {exam.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7">
                    <div className="grid grid-cols-3 gap-3">
                      <ExamDetail
                        icon={Clock3}
                        label="Duración"
                        value={`${exam.durationMinutes} min`}
                      />

                      <ExamDetail
                        icon={Target}
                        label="Ponderación"
                        value={`${exam.weight}%`}
                      />

                      <ExamDetail
                        icon={BookOpen}
                        label="Intentos"
                        value={`${exam.attemptsUsed}/${exam.attemptsAllowed}`}
                      />
                    </div>

                    <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          aria-hidden="true"
                          className="h-5 w-5 text-primary"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {statusLabels[
                              exam.status
                            ]}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {
                              exam.availableLabel
                            }
                          </p>
                        </div>

                        {typeof exam.previousScore ===
                          "number" && (
                          <span className="text-lg font-semibold text-primary">
                            {
                              exam.previousScore
                            }
                            %
                          </span>
                        )}
                      </div>
                    </div>

                    {available ? (
                      <Link
                        href={`/student/exams/${exam.id}`}
                        className="group mt-6 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        Comenzar evaluación

                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-5 text-sm font-semibold text-muted-foreground"
                      >
                        {exam.status ===
                        "upcoming" ? (
                          <>
                            <LockKeyhole
                              aria-hidden="true"
                              className="h-4 w-4"
                            />

                            Aún no disponible
                          </>
                        ) : (
                          <>
                            <CheckCircle2
                              aria-hidden="true"
                              className="h-4 w-4"
                            />

                            Evaluación completada
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            },
          )}
        </section>
      ) : (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Sparkles
              aria-hidden="true"
              className="h-6 w-6"
            />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            No encontramos evaluaciones
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Modifica el texto de búsqueda
            o selecciona otro estado.
          </p>
        </section>
      )}
    </div>
  );
}

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: MetricCardProps) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
      <Icon
        aria-hidden="true"
        className="mx-auto h-5 w-5 text-[#59e4d2]"
      />

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>

      <p className="text-[0.65rem] text-white/45">
        {label}
      </p>
    </div>
  );
}

interface ExamDetailProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function ExamDetail({
  icon: Icon,
  label,
  value,
}: ExamDetailProps) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-3 text-center">
      <Icon
        aria-hidden="true"
        className="mx-auto h-4 w-4 text-primary"
      />

      <p className="mt-2 text-xs font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.62rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}