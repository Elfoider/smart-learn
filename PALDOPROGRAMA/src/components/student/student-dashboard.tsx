"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  Play,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import {
  studentActivities,
  studentCourses,
  upcomingClasses,
  type CourseTone,
  type StudentActivity,
} from "@/data/student-dashboard";
import { cn } from "@/lib/utils/cn";

const courseToneClasses: Record<
  CourseTone,
  {
    surface: string;
    icon: string;
    glow: string;
  }
> = {
  teal: {
    surface: "from-[#0d4f51] via-[#116363] to-[#0d7370]",
    icon: "bg-[#41e0ce] text-[#062321]",
    glow: "bg-[#4ce7d4]/25",
  },
  violet: {
    surface: "from-[#352c69] via-[#463784] to-[#5b46a2]",
    icon: "bg-[#b9a7ff] text-[#211747]",
    glow: "bg-[#9f87ff]/25",
  },
  amber: {
    surface: "from-[#674319] via-[#85591f] to-[#a16d23]",
    icon: "bg-[#ffd27b] text-[#432804]",
    glow: "bg-[#ffc45b]/25",
  },
};

const activityIcons: Record<StudentActivity["type"], LucideIcon> = {
  assignment: FileText,
  practice: Sparkles,
  exam: CheckCircle2,
};

function getFirstName(name?: string) {
  if (!name) {
    return "estudiante";
  }

  return name.trim().split(" ")[0];
}

export function StudentDashboard() {
  const { profile } = useAuth();

  const firstName = getFirstName(profile?.name);
  const mainCourse = studentCourses[0];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071d25] px-6 py-7 text-white shadow-2xl sm:px-8 sm:py-9 lg:px-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(45,224,199,0.23),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(120,108,255,0.23),transparent_35%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.72fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-xl">
              <Sparkles aria-hidden="true" className="h-4 w-4 text-[#52e7d4]" />
              Tu salón virtual
            </div>

            <h1 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Hola, {firstName}.
              <br />
              ¿Listo para continuar?
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Tienes una clase en progreso y tres actividades programadas para
              esta semana.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/student/courses/programacion-web"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#34dbc5] px-5 text-sm font-bold text-[#041b18] shadow-xl shadow-[#34dbc5]/20 transition-all hover:-translate-y-0.5"
              >
                <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                Continuar clase
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/student/calendar"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white backdrop-blur-xl transition-colors hover:bg-white/[0.1]"
              >
                <CalendarDays aria-hidden="true" className="h-4 w-4" />
                Ver mi semana
              </Link>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.065] p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#67ead9]">
                  Continúa donde quedaste
                </p>

                <h2 className="mt-3 text-lg font-semibold">
                  {mainCourse.nextLesson}
                </h2>

                <p className="mt-2 text-sm text-white/50">{mainCourse.title}</p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#34dbc5] text-[#05211e]">
                <BookOpen aria-hidden="true" className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/50">
                <span>
                  {mainCourse.completedLessons} de {mainCourse.totalLessons}{" "}
                  clases
                </span>

                <span>{mainCourse.progress}%</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#35ddc7] to-[#7c78ff]"
                  style={{
                    width: `${mainCourse.progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-white/45">
              <Clock aria-hidden="true" className="h-4 w-4" />
              Duración aproximada: {mainCourse.duration}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Mis aulas
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Continúa aprendiendo
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Accede a tus asignaturas, clases y materiales.
            </p>
          </div>

          <Link
            href="/student/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Ver todas las materias
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {studentCourses.map((course, index) => {
            const tone = courseToneClasses[course.tone];

            return (
              <motion.article
                key={course.id}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                className={cn(
                  "group relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br p-5 text-white shadow-xl transition-transform duration-300 hover:-translate-y-1",
                  tone.surface,
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl",
                    tone.glow,
                  )}
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-2xl",
                        tone.icon,
                      )}
                    >
                      <BookOpen aria-hidden="true" className="h-5 w-5" />
                    </div>

                    <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-white/75">
                      {course.code}
                    </span>
                  </div>

                  <h3 className="mt-6 min-h-14 text-lg font-semibold leading-7">
                    {course.title}
                  </h3>

                  <p className="mt-2 text-xs text-white/55">{course.teacher}</p>

                  <div className="mt-6 flex items-center justify-between text-xs text-white/55">
                    <span>
                      {course.completedLessons}/{course.totalLessons} clases
                    </span>

                    <span>{course.progress}%</span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>

                  <Link
                    href={`/student/courses/${course.id}`}
                    className="mt-6 flex min-h-11 items-center justify-between rounded-2xl border border-white/12 bg-white/[0.08] px-4 text-sm font-semibold backdrop-blur-xl transition-colors hover:bg-white/[0.14]"
                  >
                    Entrar al aula
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Pendientes
              </p>

              <h2 className="mt-2 text-xl font-semibold">Próximos pasos</h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Flame aria-hidden="true" className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {studentActivities.map((activity) => {
              const Icon = activityIcons[activity.type];

              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 transition-all hover:border-primary/30 hover:bg-background"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {activity.title}
                    </h3>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {activity.course}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        activity.urgent
                          ? "text-danger"
                          : "text-muted-foreground",
                      )}
                    >
                      {activity.dueLabel}
                    </p>

                    <ArrowRight
                      aria-hidden="true"
                      className="ml-auto mt-2 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Agenda académica
              </p>

              <h2 className="mt-2 text-xl font-semibold">Próximas clases</h2>
            </div>

            <Link
              href="/student/calendar"
              className="text-xs font-semibold text-primary"
            >
              Ver calendario
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {upcomingClasses.map((classItem) => (
              <article key={classItem.id} className="flex gap-4">
                <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-background/65 px-2 py-3 text-center">
                  <span className="text-[0.65rem] font-semibold uppercase text-muted-foreground">
                    {classItem.day}
                  </span>

                  <span className="mt-1 text-sm font-bold">
                    {classItem.time}
                  </span>
                </div>

                <div className="min-w-0 flex-1 border-b border-border pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-primary">
                        {classItem.course}
                      </p>

                      <h3 className="mt-1 truncate text-sm font-semibold">
                        {classItem.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {classItem.teacher}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                      {classItem.type === "live" ? (
                        <Video aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <Play aria-hidden="true" className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[1.7rem] border border-border bg-card/75 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Trophy aria-hidden="true" className="h-5 w-5" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">8</p>

          <p className="mt-1 text-sm font-semibold">Actividades completadas</p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Has completado dos actividades más que la semana anterior.
          </p>
        </article>

        <article className="rounded-[1.7rem] border border-border bg-card/75 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Clock aria-hidden="true" className="h-5 w-5" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight">6.4 h</p>

          <p className="mt-1 text-sm font-semibold">Tiempo de estudio</p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Tiempo acumulado en clases, prácticas y materiales.
          </p>
        </article>

        <article className="rounded-[1.7rem] border border-primary/20 bg-secondary p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles aria-hidden="true" className="h-5 w-5" />
          </div>

          <p className="mt-5 text-3xl font-semibold tracking-tight text-secondary-foreground">
            12
          </p>

          <p className="mt-1 text-sm font-semibold text-secondary-foreground">
            Prácticas con IA
          </p>

          <p className="mt-2 text-xs leading-5 text-secondary-foreground/70">
            Sigue practicando para fortalecer tus temas con menor dominio.
          </p>
        </article>
      </section>
    </div>
  );
}
