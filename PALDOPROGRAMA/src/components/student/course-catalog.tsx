"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Filter,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  learningCourses,
  type LearningCourse,
} from "@/data/course-content";
import { cn } from "@/lib/utils/cn";

const toneStyles: Record<
  LearningCourse["tone"],
  {
    background: string;
    icon: string;
    glow: string;
  }
> = {
  teal: {
    background:
      "from-[#083d43] via-[#0d565a] to-[#14736f]",
    icon: "bg-[#5ce7d5] text-[#06231f]",
    glow: "bg-[#47e2cf]/25",
  },
  violet: {
    background:
      "from-[#30275e] via-[#47387d] to-[#624ca1]",
    icon: "bg-[#c1b4ff] text-[#251b4d]",
    glow: "bg-[#a590ff]/25",
  },
  amber: {
    background:
      "from-[#5b3a13] via-[#79501b] to-[#9e6c26]",
    icon: "bg-[#ffd887] text-[#442904]",
    glow: "bg-[#ffc863]/25",
  },
};

const categories = [
  "Todas",
  "Ingeniería de software",
  "Gestión de datos",
  "Tecnologías emergentes",
];

export function CourseCatalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("Todas");

  const filteredCourses = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return learningCourses.filter((course) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        course.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.teacher
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.code
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        category === "Todas" ||
        course.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [category, search]);

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <GraduationCap
                aria-hidden="true"
                className="h-4 w-4"
              />

              Mi formación
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Mis materias
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Entra en cada aula para acceder a sus
              unidades, lecciones, materiales y
              actividades académicas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-md">
            <div className="rounded-2xl border border-border bg-background/65 p-4 text-center">
              <p className="text-2xl font-semibold">
                {learningCourses.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Materias
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/65 p-4 text-center">
              <p className="text-2xl font-semibold">
                16
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Completadas
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/65 p-4 text-center">
              <p className="text-2xl font-semibold">
                49%
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Progreso
              </p>
            </div>
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
              setSearch(event.target.value);
            }}
            placeholder="Buscar por materia, código o docente"
            className="h-12 w-full rounded-2xl border border-border bg-background/70 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Filter
              aria-hidden="true"
              className="h-4 w-4"
            />
          </div>

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCategory(item);
              }}
              className={cn(
                "min-h-11 shrink-0 rounded-2xl border px-4 text-xs font-semibold transition-all",
                category === item
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-border bg-background/65 text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {filteredCourses.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-2">
          {filteredCourses.map((course) => {
            const styles =
              toneStyles[course.tone];

            return (
              <article
                key={course.id}
                className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={cn(
                    "relative overflow-hidden bg-gradient-to-br p-6 text-white sm:p-7",
                    styles.background,
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl",
                      styles.glow,
                    )}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg",
                          styles.icon,
                        )}
                      >
                        <BookOpen
                          aria-hidden="true"
                          className="h-5 w-5"
                        />
                      </div>

                      <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[0.68rem] font-semibold tracking-wide text-white/75 backdrop-blur-xl">
                        {course.code}
                      </span>
                    </div>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                      {course.category}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                      {course.title}
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-foreground">
                      {course.teacher
                        .split(" ")
                        .filter(Boolean)
                        .slice(-2)
                        .map((part) => part[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {course.teacher}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {course.teacherRole}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-background/65 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2
                          aria-hidden="true"
                          className="h-4 w-4"
                        />

                        <span className="text-xs font-medium">
                          Lecciones
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold">
                        {course.completedLessons} de{" "}
                        {course.totalLessons}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/65 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock3
                          aria-hidden="true"
                          className="h-4 w-4"
                        />

                        <span className="text-xs font-medium">
                          Duración
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold">
                        {course.estimatedTime}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        Progreso de la materia
                      </span>

                      <span className="font-semibold text-primary">
                        {course.progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-[#756fff]"
                        style={{
                          width: `${course.progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/student/courses/${course.id}`}
                    className="group mt-7 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Entrar al aula

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
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
            No encontramos materias
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Cambia el texto de búsqueda o selecciona
            otra categoría.
          </p>
        </section>
      )}
    </div>
  );
}