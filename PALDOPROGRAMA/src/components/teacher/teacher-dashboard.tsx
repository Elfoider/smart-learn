import type {
  LucideIcon,
} from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FilePlus2,
  FileText,
  GraduationCap,
  ListChecks,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";

import {
  teacherAcademicAlerts,
  teacherCourses,
  teacherMetrics,
  teacherRecentActivity,
  teacherUpcomingActivities,
  type TeacherCourseTone,
  type TeacherMetricType,
  type TeacherUpcomingActivity,
} from "@/data/teacher-dashboard";
import { cn } from "@/lib/utils/cn";

const metricIcons: Record<
  TeacherMetricType,
  LucideIcon
> = {
  courses: BookOpen,
  students: Users,
  pending: ClipboardCheck,
  average: TrendingUp,
};

const courseToneStyles: Record<
  TeacherCourseTone,
  {
    background: string;
    accent: string;
    progress: string;
  }
> = {
  teal: {
    background:
      "from-[#073d43] via-[#0c5559] to-[#13736e]",
    accent:
      "bg-[#59e4d2] text-[#05231f]",
    progress: "bg-[#43d8c5]",
  },
  violet: {
    background:
      "from-[#30275e] via-[#46377c] to-[#604a9e]",
    accent:
      "bg-[#bcaeff] text-[#251c4b]",
    progress: "bg-[#a996ff]",
  },
  amber: {
    background:
      "from-[#5c3b14] via-[#7c511c] to-[#9e6c27]",
    accent:
      "bg-[#ffd581] text-[#432904]",
    progress: "bg-[#f3b94d]",
  },
  blue: {
    background:
      "from-[#17365d] via-[#1f4f7d] to-[#286a9c]",
    accent:
      "bg-[#9dd8ff] text-[#0c2c44]",
    progress: "bg-[#70c6ff]",
  },
};

const activityIcons: Record<
  TeacherUpcomingActivity["type"],
  LucideIcon
> = {
  assessment: ClipboardCheck,
  class: GraduationCap,
  planning: FileText,
  grading: ListChecks,
};

export function TeacherDashboard() {
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,222,199,0.25),transparent_33%),radial-gradient(circle_at_88%_88%,rgba(117,104,255,0.23),transparent_35%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#62ead8]">
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4"
              />

              Centro de gestión académica
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Organiza tu período académico desde un solo lugar.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Consulta tus asignaturas, estudiantes, actividades y alertas de seguimiento.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/teacher/courses"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/15"
              >
                <Plus
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Crear asignatura
              </Link>

              <Link
                href="/teacher/ai"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white"
              >
                <WandSparkles
                  aria-hidden="true"
                  className="h-4 w-4 text-[#62ead8]"
                />

                Generar planificación con IA
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            <HeroMetric
              value="6"
              label="Secciones"
            />

            <HeroMetric
              value="91%"
              label="Asistencia máxima"
            />

            <HeroMetric
              value="5"
              label="Por calificar"
            />

            <HeroMetric
              value="3"
              label="Alertas activas"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {teacherMetrics.map((metric) => {
          const Icon =
            metricIcons[metric.type];

          return (
            <article
              key={metric.id}
              className="rounded-[1.7rem] border border-border bg-card/75 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <span className="rounded-full border border-primary/15 bg-secondary px-2.5 py-1 text-[0.62rem] font-semibold text-secondary-foreground">
                  {metric.trend}
                </span>
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                {metric.value}
              </p>

              <p className="mt-2 text-sm font-semibold">
                {metric.label}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {metric.detail}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.7fr)]">
        <div className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Carga académica
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Mis asignaturas y secciones
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Rendimiento y seguimiento general del período.
              </p>
            </div>

            <Link
              href="/teacher/courses"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-4 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            >
              Ver todas

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {teacherCourses.map((course) => {
              const tone =
                courseToneStyles[course.tone];

              return (
                <article
                  key={course.id}
                  className="overflow-hidden rounded-[1.7rem] border border-border bg-background/55"
                >
                  <div
                    className={cn(
                      "relative overflow-hidden bg-gradient-to-br p-5 text-white",
                      tone.background,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-bold",
                          tone.accent,
                        )}
                      >
                        {course.code
                          .split("-")[0]
                          .slice(0, 2)}
                      </div>

                      <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.65rem] font-semibold text-white/70">
                        {course.section}
                      </span>
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-white/45">
                      {course.code} · {course.period}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      {course.title}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 text-xs text-white/55">
                      <Clock3
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      {course.schedule}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3">
                      <CourseMetric
                        value={`${course.students}`}
                        label="Estudiantes"
                      />

                      <CourseMetric
                        value={`${course.average}%`}
                        label="Promedio"
                      />

                      <CourseMetric
                        value={`${course.attendance}%`}
                        label="Asistencia"
                      />
                    </div>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Rendimiento general
                        </span>

                        <span className="font-semibold text-primary">
                          {course.average}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            tone.progress,
                          )}
                          style={{
                            width: `${course.average}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ClipboardCheck
                          aria-hidden="true"
                          className="h-4 w-4 text-primary"
                        />

                        {course.pendingActivities} pendientes
                      </div>

                      <Link
                        href="/teacher/courses"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        Administrar

                        <ArrowRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-primary/15 bg-secondary p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Bot
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground/60">
                  Inteligencia artificial
                </p>

                <h2 className="mt-1 text-lg font-semibold text-secondary-foreground">
                  Copiloto docente
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-secondary-foreground/75">
              Crea un borrador de planificación, una rúbrica o una actividad a partir del contenido de tu asignatura.
            </p>

            <div className="mt-5 grid gap-2">
              {[
                "Generar planificación semanal",
                "Crear rúbrica de evaluación",
                "Proponer actividad práctica",
              ].map((action) => (
                <div
                  key={action}
                  className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/50 p-3 text-xs font-medium text-secondary-foreground"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="h-4 w-4 text-primary"
                  />

                  {action}
                </div>
              ))}
            </div>

            <Link
              href="/teacher/ai"
              className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
            >
              <WandSparkles
                aria-hidden="true"
                className="h-4 w-4"
              />

              Abrir copiloto
            </Link>
          </section>

          <section className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Rendimiento
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  Promedio por materia
                </h2>
              </div>

              <BarChart3
                aria-hidden="true"
                className="h-5 w-5 text-muted-foreground"
              />
            </div>

            <div className="mt-6 space-y-4">
              {teacherCourses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {course.code}
                    </span>

                    <span className="text-muted-foreground">
                      {course.average}%
                    </span>
                  </div>

                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-[#756fff]"
                      style={{
                        width: `${course.average}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/teacher/reports"
              className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-primary"
            >
              Consultar reportes detallados

              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Link>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <article className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Agenda académica
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Próximas actividades
              </h2>
            </div>

            <CalendarCheck2
              aria-hidden="true"
              className="h-5 w-5 text-muted-foreground"
            />
          </div>

          <div className="mt-6 space-y-3">
            {teacherUpcomingActivities.map(
              (activity) => {
                const Icon =
                  activityIcons[activity.type];

                return (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-4 rounded-[1.4rem] border border-border bg-background/60 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Icon
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.courseCode} · {activity.courseTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          activity.status === "today"
                            ? "text-danger"
                            : "text-primary",
                        )}
                      >
                        {activity.date}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Seguimiento
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Alertas académicas
            </h2>
          </div>

          <div className="mt-6 space-y-3">
            {teacherAcademicAlerts.map(
              (alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-[1.4rem] border p-4",
                    alert.tone === "danger" &&
                      "border-danger/20 bg-danger/5",
                    alert.tone === "warning" &&
                      "border-[#dfaa3c]/25 bg-[#fff5d9] dark:bg-[#433216]",
                    alert.tone === "info" &&
                      "border-primary/20 bg-secondary",
                  )}
                >
                  <div className="flex gap-3">
                    <AlertTriangle
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0",
                        alert.tone === "danger" &&
                          "text-danger",
                        alert.tone === "warning" &&
                          "text-[#b77a05]",
                        alert.tone === "info" &&
                          "text-primary",
                      )}
                    />

                    <div>
                      <h3 className="text-sm font-semibold">
                        {alert.title}
                      </h3>

                      <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        {alert.description}
                      </p>

                      <Link
                        href={alert.href}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        {alert.actionLabel}

                        <ArrowRight
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Acciones rápidas
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            ¿Qué necesitas hacer?
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <QuickAction
              icon={FilePlus2}
              title="Crear planificación"
              description="Organiza objetivos, contenidos y actividades."
              href="/teacher/planning"
            />

            <QuickAction
              icon={ClipboardCheck}
              title="Nueva evaluación"
              description="Define preguntas, ponderación y rúbrica."
              href="/teacher/assessments"
            />

            <QuickAction
              icon={UserPlus}
              title="Vincular estudiante"
              description="Agrega estudiantes a una sección."
              href="/teacher/students"
            />

            <QuickAction
              icon={GraduationCap}
              title="Publicar material"
              description="Comparte documentos, videos o enlaces."
              href="/teacher/materials"
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Registro reciente
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Actividad del portal
              </h2>
            </div>

            <Target
              aria-hidden="true"
              className="h-5 w-5 text-muted-foreground"
            />
          </div>

          <div className="mt-6 space-y-4">
            {teacherRecentActivity.map(
              (activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4"
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="min-w-0 flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>

                      <span className="text-[0.65rem] text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

interface HeroMetricProps {
  value: string;
  label: string;
}

function HeroMetric({
  value,
  label,
}: HeroMetricProps) {
  return (
    <div className="min-w-28 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.65rem] text-white/45">
        {label}
      </p>
    </div>
  );
}

interface CourseMetricProps {
  value: string;
  label: string;
}

function CourseMetric({
  value,
  label,
}: CourseMetricProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <p className="text-sm font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

interface QuickActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-[1.4rem] border border-border bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background hover:shadow-lg"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
        <Icon
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
        Abrir módulo

        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}