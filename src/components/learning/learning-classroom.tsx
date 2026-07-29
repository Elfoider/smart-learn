"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Expand,
  FileText,
  GraduationCap,
  Lightbulb,
  ListTree,
  LockKeyhole,
  Menu,
  MessageSquareText,
  Minimize,
  MoreHorizontal,
  NotebookPen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Presentation,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  CourseLesson,
  LearningCourse,
  LessonContentType,
} from "@/data/course-content";
import { cn } from "@/lib/utils/cn";

interface LearningClassroomProps {
  course: LearningCourse;
}

interface FlatLesson {
  unitId: string;
  unitTitle: string;
  lesson: CourseLesson;
}

const contentIcons: Record<
  LessonContentType,
  LucideIcon
> = {
  slides: Presentation,
  video: Play,
  document: FileText,
  practice: NotebookPen,
};

const contentLabels: Record<
  LessonContentType,
  string
> = {
  slides: "Diapositivas",
  video: "Videoclase",
  document: "Documento",
  practice: "Práctica",
};

export function LearningClassroom({
  course,
}: LearningClassroomProps) {
  const flatLessons = useMemo<FlatLesson[]>(
    () =>
      course.units.flatMap((unit) =>
        unit.lessons.map((lesson) => ({
          unitId: unit.id,
          unitTitle: unit.title,
          lesson,
        })),
      ),
    [course.units],
  );

  const initialLesson =
    flatLessons.find(
      ({ lesson }) =>
        !lesson.completed && !lesson.locked,
    ) ??
    flatLessons.find(
      ({ lesson }) => !lesson.locked,
    ) ??
    flatLessons[0];

  const [selectedLessonId, setSelectedLessonId] =
    useState(initialLesson.lesson.id);

  const [completedLessonIds, setCompletedLessonIds] =
    useState<string[]>(
      flatLessons
        .filter(({ lesson }) => lesson.completed)
        .map(({ lesson }) => lesson.id),
    );

  const [openUnitIds, setOpenUnitIds] =
    useState<string[]>(
      course.units.map((unit) => unit.id),
    );

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [focusMode, setFocusMode] =
    useState(false);

  const selectedIndex =
    flatLessons.findIndex(
      ({ lesson }) =>
        lesson.id === selectedLessonId,
    );

  const currentItem =
    flatLessons[selectedIndex];

  const currentLesson = currentItem.lesson;
  const ContentIcon =
    contentIcons[currentLesson.contentType];

  const completedCount =
    completedLessonIds.length;

  const progress = Math.round(
    (completedCount / flatLessons.length) * 100,
  );

  const previousLesson =
    selectedIndex > 0
      ? flatLessons[selectedIndex - 1]
      : null;

  const nextLesson =
    selectedIndex < flatLessons.length - 1
      ? flatLessons[selectedIndex + 1]
      : null;

  function selectLesson(lesson: CourseLesson) {
    if (lesson.locked) {
      return;
    }

    setSelectedLessonId(lesson.id);
    setMobileSidebarOpen(false);
  }

  function toggleUnit(unitId: string) {
    setOpenUnitIds((current) =>
      current.includes(unitId)
        ? current.filter(
            (item) => item !== unitId,
          )
        : [...current, unitId],
    );
  }

  function toggleCompleted() {
    setCompletedLessonIds((current) =>
      current.includes(currentLesson.id)
        ? current.filter(
            (id) => id !== currentLesson.id,
          )
        : [...current, currentLesson.id],
    );
  }

  function goToLesson(
    item: FlatLesson | null,
  ) {
    if (!item || item.lesson.locked) {
      return;
    }

    setSelectedLessonId(item.lesson.id);
  }

  return (
    <div
      className={cn(
        "relative",
        focusMode &&
          "fixed inset-0 z-[70] overflow-auto bg-background p-4 sm:p-6",
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/student/courses"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-5 w-5"
            />
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {course.code}
            </p>

            <h1 className="mt-1 line-clamp-1 text-lg font-semibold sm:text-xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(
                (current) => !current,
              );
            }}
            className="hidden h-11 items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 text-xs font-semibold text-muted-foreground transition-all hover:text-foreground lg:flex"
          >
            {sidebarOpen ? (
              <PanelRightClose
                aria-hidden="true"
                className="h-4 w-4"
              />
            ) : (
              <PanelRightOpen
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}

            Contenido
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileSidebarOpen(true);
            }}
            className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 text-xs font-semibold text-muted-foreground lg:hidden"
          >
            <Menu
              aria-hidden="true"
              className="h-4 w-4"
            />

            Clases
          </button>

          <button
            type="button"
            onClick={() => {
              setFocusMode(
                (current) => !current,
              );
            }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
            aria-label={
              focusMode
                ? "Salir del modo enfoque"
                : "Activar modo enfoque"
            }
          >
            {focusMode ? (
              <Minimize
                aria-hidden="true"
                className="h-5 w-5"
              />
            ) : (
              <Expand
                aria-hidden="true"
                className="h-5 w-5"
              />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-[calc(100vh-12rem)] gap-5",
          sidebarOpen
            ? "lg:grid-cols-[minmax(0,1fr)_23rem]"
            : "grid-cols-1",
        )}
      >
        <main className="min-w-0 space-y-5">
          <section className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <ContentIcon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-primary">
                    {currentItem.unitTitle}
                  </p>

                  <h2 className="mt-1 text-sm font-semibold sm:text-base">
                    {currentLesson.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  {currentLesson.duration}
                </span>

                <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 font-semibold">
                  {
                    contentLabels[
                      currentLesson.contentType
                    ]
                  }
                </span>

                <button
                  type="button"
                  aria-label="Más opciones"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border"
                >
                  <MoreHorizontal
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>

            <LessonViewer
              lesson={currentLesson}
              course={course}
            />

            <div className="flex flex-col gap-4 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                type="button"
                onClick={toggleCompleted}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-all",
                  completedLessonIds.includes(
                    currentLesson.id,
                  )
                    ? "border-primary/30 bg-secondary text-secondary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                )}
              >
                {completedLessonIds.includes(
                  currentLesson.id,
                ) ? (
                  <>
                    <CheckCircle2
                      aria-hidden="true"
                      className="h-4 w-4"
                    />

                    Clase completada
                  </>
                ) : (
                  <>
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4"
                    />

                    Marcar como completada
                  </>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={
                    !previousLesson ||
                    previousLesson.lesson.locked
                  }
                  onClick={() => {
                    goToLesson(previousLesson);
                  }}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-4 text-sm font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
                >
                  <ChevronLeft
                    aria-hidden="true"
                    className="h-4 w-4"
                  />

                  Anterior
                </button>

                <button
                  type="button"
                  disabled={
                    !nextLesson ||
                    nextLesson.lesson.locked
                  }
                  onClick={() => {
                    goToLesson(nextLesson);
                  }}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40 sm:flex-none"
                >
                  Siguiente

                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
            <article className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <GraduationCap
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Objetivo
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Propósito de la clase
                  </h3>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {currentLesson.objective}
              </p>

              <div className="mt-5 rounded-2xl border border-primary/15 bg-secondary p-4">
                <div className="flex gap-3">
                  <Lightbulb
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-secondary-foreground"
                  />

                  <p className="text-sm leading-6 text-secondary-foreground/80">
                    Toma notas durante la clase y
                    revisa los recursos antes de
                    avanzar a la siguiente lección.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Materiales
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    Recursos de apoyo
                  </h3>
                </div>

                <Download
                  aria-hidden="true"
                  className="h-5 w-5 text-muted-foreground"
                />
              </div>

              <div className="mt-5 space-y-3">
                {currentLesson.resources.map(
                  (resource) => (
                    <button
                      key={resource}
                      type="button"
                      className="flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 text-left text-sm font-medium transition-all hover:border-primary/30"
                    >
                      <FileText
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-primary"
                      />

                      <span className="flex-1">
                        {resource}
                      </span>

                      <Download
                        aria-hidden="true"
                        className="h-4 w-4 text-muted-foreground"
                      />
                    </button>
                  ),
                )}
              </div>
            </article>
          </section>

          <section className="rounded-[1.8rem] border border-primary/15 bg-secondary p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Sparkles
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-secondary-foreground">
                    ¿Necesitas reforzar este tema?
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary-foreground/70">
                    Usa el playground para recibir
                    explicaciones, practicar y solicitar
                    pistas relacionadas con esta clase.
                  </p>
                </div>
              </div>

              <Link
                href="/student/playground"
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
              >
                Practicar ahora

                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </Link>
            </div>
          </section>
        </main>

        {sidebarOpen && (
          <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl lg:flex lg:flex-col">
            <CourseContentSidebar
              course={course}
              currentLessonId={currentLesson.id}
              completedLessonIds={
                completedLessonIds
              }
              openUnitIds={openUnitIds}
              progress={progress}
              onSelectLesson={selectLesson}
              onToggleUnit={toggleUnit}
            />
          </aside>
        )}
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar contenido"
            onClick={() => {
              setMobileSidebarOpen(false);
            }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 right-0 flex w-[92%] max-w-md flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <ListTree
                  aria-hidden="true"
                  className="h-5 w-5 text-primary"
                />

                <p className="font-semibold">
                  Contenido del curso
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileSidebarOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border"
              >
                <X
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>
            </div>

            <CourseContentSidebar
              course={course}
              currentLessonId={currentLesson.id}
              completedLessonIds={
                completedLessonIds
              }
              openUnitIds={openUnitIds}
              progress={progress}
              onSelectLesson={selectLesson}
              onToggleUnit={toggleUnit}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

interface CourseContentSidebarProps {
  course: LearningCourse;
  currentLessonId: string;
  completedLessonIds: string[];
  openUnitIds: string[];
  progress: number;
  onSelectLesson: (
    lesson: CourseLesson,
  ) => void;
  onToggleUnit: (unitId: string) => void;
}

function CourseContentSidebar({
  course,
  currentLessonId,
  completedLessonIds,
  openUnitIds,
  progress,
  onSelectLesson,
  onToggleUnit,
}: CourseContentSidebarProps) {
  return (
    <>
      <div className="border-b border-border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Contenido
            </p>

            <h2 className="mt-1 font-semibold">
              Programa de la materia
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <ListTree
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Progreso general
          </span>

          <span className="font-semibold text-primary">
            {progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-[#756fff]"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {course.units.map(
            (unit, unitIndex) => {
              const open =
                openUnitIds.includes(unit.id);

              const completedInUnit =
                unit.lessons.filter((lesson) =>
                  completedLessonIds.includes(
                    lesson.id,
                  ),
                ).length;

              return (
                <section
                  key={unit.id}
                  className="overflow-hidden rounded-2xl border border-border bg-background/55"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onToggleUnit(unit.id);
                    }}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground">
                      {unitIndex + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">
                        {unit.title}
                      </p>

                      <p className="mt-1 text-[0.68rem] text-muted-foreground">
                        {completedInUnit} de{" "}
                        {unit.lessons.length} completadas
                      </p>
                    </div>

                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>

                  {open && (
                    <div className="border-t border-border p-2">
                      {unit.lessons.map(
                        (
                          lesson,
                          lessonIndex,
                        ) => {
                          const Icon =
                            contentIcons[
                              lesson.contentType
                            ];

                          const active =
                            lesson.id ===
                            currentLessonId;

                          const completed =
                            completedLessonIds.includes(
                              lesson.id,
                            );

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              disabled={lesson.locked}
                              onClick={() => {
                                onSelectLesson(
                                  lesson,
                                );
                              }}
                              className={cn(
                                "group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all",
                                active
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                lesson.locked &&
                                  "cursor-not-allowed opacity-45",
                              )}
                            >
                              <div
                                className={cn(
                                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[0.65rem] font-bold",
                                  active
                                    ? "border-white/20 bg-white/10"
                                    : completed
                                      ? "border-primary/20 bg-secondary text-secondary-foreground"
                                      : "border-border bg-card",
                                )}
                              >
                                {lesson.locked ? (
                                  <LockKeyhole
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                  />
                                ) : completed ? (
                                  <Check
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                  />
                                ) : (
                                  lessonIndex + 1
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-xs font-semibold leading-5">
                                  {lesson.title}
                                </p>

                                <div
                                  className={cn(
                                    "mt-1 flex items-center gap-2 text-[0.65rem]",
                                    active
                                      ? "text-white/65"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  <Icon
                                    aria-hidden="true"
                                    className="h-3 w-3"
                                  />

                                  <span>
                                    {
                                      contentLabels[
                                        lesson
                                          .contentType
                                      ]
                                    }
                                  </span>

                                  <span>·</span>

                                  <span>
                                    {
                                      lesson.duration
                                    }
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </section>
              );
            },
          )}
        </div>
      </div>
    </>
  );
}

interface LessonViewerProps {
  lesson: CourseLesson;
  course: LearningCourse;
}

function LessonViewer({
  lesson,
  course,
}: LessonViewerProps) {
  if (
    lesson.contentType === "slides" &&
    lesson.slide
  ) {
    return (
      <div className="relative flex min-h-[31rem] items-center justify-center overflow-hidden bg-[#06171e] p-5 text-white sm:p-8 lg:min-h-[38rem]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(44,221,198,0.22),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(112,101,255,0.22),transparent_34%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative z-10 w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-9 lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5ce6d4]">
              {lesson.slide.eyebrow}
            </p>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/55">
              {lesson.slide.number} /{" "}
              {lesson.slide.total}
            </span>
          </div>

          <h3 className="mt-8 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {lesson.slide.title}
          </h3>

          <p className="mt-6 max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
            {lesson.slide.body}
          </p>

          <div className="mt-8 grid gap-3">
            {lesson.slide.points.map(
              (point, index) => (
                <div
                  key={point}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#35ddc7] text-xs font-bold text-[#04231f]">
                    {index + 1}
                  </div>

                  <p className="pt-1 text-sm leading-6 text-white/75">
                    {point}
                  </p>
                </div>
              ),
            )}
          </div>

          <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-xs text-white/35">
              {course.title}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]"
              >
                <ChevronLeft
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#35ddc7] text-[#04231f]"
              >
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lesson.contentType === "video") {
    return (
      <div className="relative flex min-h-[31rem] items-center justify-center overflow-hidden bg-[#041116] p-6 text-white lg:min-h-[38rem]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(42,213,191,0.17),transparent_40%)]"
        />

        <div className="relative z-10 flex max-w-xl flex-col items-center text-center">
          <button
            type="button"
            className="group flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] shadow-2xl backdrop-blur-xl transition-all hover:scale-105 hover:bg-[#35ddc7] hover:text-[#04231f]"
          >
            <Play
              aria-hidden="true"
              className="ml-1 h-9 w-9 fill-current"
            />
          </button>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-[#5ce6d4]">
            Videoclase
          </p>

          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">
            {lesson.title}
          </h3>

          <p className="mt-4 text-sm leading-7 text-white/55">
            {lesson.description}
          </p>

          <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[18%] rounded-full bg-[#35ddc7]" />
          </div>

          <div className="mt-3 flex w-full items-center justify-between text-xs text-white/40">
            <span>04:18</span>
            <span>{lesson.duration}</span>
          </div>
        </div>
      </div>
    );
  }

  if (lesson.contentType === "document") {
    return (
      <div className="flex min-h-[31rem] items-center justify-center bg-muted/35 p-5 lg:min-h-[38rem]">
        <div className="w-full max-w-3xl rounded-[1.5rem] border border-border bg-white p-7 text-[#17202b] shadow-2xl sm:p-10 lg:p-12">
          <div className="flex items-center justify-between border-b border-[#dfe5ec] pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4f7] text-[#176d68]">
                <FileText
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#176d68]">
                  Lectura académica
                </p>

                <p className="mt-1 text-sm font-semibold">
                  Smart Learn
                </p>
              </div>
            </div>

            <span className="text-xs text-[#73808d]">
              Página 1 de 4
            </span>
          </div>

          <h3 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            {lesson.title}
          </h3>

          <p className="mt-5 text-sm leading-7 text-[#53606d]">
            {lesson.description}
          </p>

          <h4 className="mt-8 text-base font-semibold">
            Objetivo de aprendizaje
          </h4>

          <p className="mt-3 text-sm leading-7 text-[#53606d]">
            {lesson.objective}
          </p>

          <div className="mt-8 rounded-xl border-l-4 border-[#22b8aa] bg-[#eef9f7] p-4">
            <p className="text-sm leading-6 text-[#315b57]">
              Lee el documento completo y registra
              los conceptos que consideres más
              importantes para la discusión de la
              clase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[31rem] items-center justify-center overflow-hidden bg-[#081820] p-6 text-white lg:min-h-[38rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(53,221,199,0.2),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(118,111,255,0.2),transparent_34%)]"
      />

      <div className="relative z-10 w-full max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#35ddc7] text-[#04231f]">
            <NotebookPen
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/55">
            Actividad práctica
          </span>
        </div>

        <h3 className="mt-7 text-2xl font-semibold sm:text-3xl">
          {lesson.title}
        </h3>

        <p className="mt-4 text-sm leading-7 text-white/60">
          {lesson.description}
        </p>

        <div className="mt-7 rounded-2xl border border-white/10 bg-black/15 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5ce6d4]">
            Instrucción
          </p>

          <p className="mt-3 text-sm leading-7 text-white/75">
            Analiza el planteamiento, desarrolla tu
            solución y adjunta la evidencia solicitada.
            Podrás revisar la rúbrica antes de entregar.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] text-sm font-semibold"
          >
            <FileText
              aria-hidden="true"
              className="h-4 w-4"
            />

            Ver instrucciones
          </button>

          <button
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#35ddc7] text-sm font-semibold text-[#04231f]"
          >
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4"
            />

            Comenzar actividad
          </button>
        </div>
      </div>
    </div>
  );
}