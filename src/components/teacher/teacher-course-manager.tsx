"use client";

import {
  Archive,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  GraduationCap,
  Layers3,
  LoaderCircle,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Users,
  Video,
  Wifi,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import {
  CourseDialog,
  SectionDialog,
} from "@/components/teacher/teacher-course-dialogs";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicCourseStatus,
  AcademicCourseTone,
  AcademicModality,
  AcademicSection,
} from "@/types/academic-course";

type StatusFilter =
  | "all"
  | AcademicCourseStatus;

type CourseDialogState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      course: AcademicCourse;
    }
  | null;

interface SectionDialogState {
  course: AcademicCourse;
  section?: AcademicSection;
}

const toneStyles: Record<
  AcademicCourseTone,
  {
    background: string;
    accent: string;
    glow: string;
  }
> = {
  teal: {
    background:
      "from-[#073d43] via-[#0c5559] to-[#13736e]",
    accent:
      "bg-[#59e4d2] text-[#05231f]",
    glow: "bg-[#45dfcc]/25",
  },
  violet: {
    background:
      "from-[#30275e] via-[#46377c] to-[#604a9e]",
    accent:
      "bg-[#bcafff] text-[#251c4b]",
    glow: "bg-[#a38cff]/25",
  },
  amber: {
    background:
      "from-[#5c3b14] via-[#7c511c] to-[#9e6c27]",
    accent:
      "bg-[#ffd581] text-[#432904]",
    glow: "bg-[#ffc760]/25",
  },
  blue: {
    background:
      "from-[#17365d] via-[#1f4f7d] to-[#286a9c]",
    accent:
      "bg-[#9dd8ff] text-[#0c2c44]",
    glow: "bg-[#70c6ff]/25",
  },
};

const statusLabels: Record<
  AcademicCourseStatus,
  string
> = {
  active: "Activa",
  draft: "Borrador",
  archived: "Archivada",
};

const modalityLabels: Record<
  AcademicModality,
  string
> = {
  "on-site": "Presencial",
  online: "En línea",
  hybrid: "Híbrida",
};

function getModalityIcon(
  modality: AcademicModality,
) {
  if (modality === "online") {
    return Video;
  }

  if (modality === "hybrid") {
    return Wifi;
  }

  return Building2;
}

function formatSchedule(
  section: AcademicSection,
) {
  const days =
    section.scheduleDays.length > 0
      ? section.scheduleDays.join(", ")
      : "Sin días";

  return `${days} · ${section.startTime}–${section.endTime}`;
}

export function TeacherCourseManager() {
  const {
    courses,
    sections,
    loading,
    saving,
    error,
    createCourse,
    editCourse,
    changeCourseStatus,
    createSection,
    editSection,
    changeSectionStatus,
  } = useTeacherCourses();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState<string | null>(null);

  const [
    courseDialog,
    setCourseDialog,
  ] = useState<CourseDialogState>(
    null,
  );

  const [
    sectionDialog,
    setSectionDialog,
  ] = useState<SectionDialogState | null>(
    null,
  );

  const selectedCourse =
    courses.find(
      (course) =>
        course.id === selectedCourseId,
    ) ??
    courses[0] ??
    null;

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredCourses =
    courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.code
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.area
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.period
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        course.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });

  const selectedSections =
    selectedCourse
      ? sections.filter(
          (section) =>
            section.courseId ===
            selectedCourse.id,
        )
      : [];

  const activeCourses =
    courses.filter(
      (course) =>
        course.status === "active",
    ).length;

  const activeSections =
    sections.filter(
      (section) =>
        section.status === "active",
    ).length;

  const totalCapacity =
    sections
      .filter(
        (section) =>
          section.status === "active",
      )
      .reduce(
        (total, section) =>
          total + section.capacity,
        0,
      );

  async function archiveCourse(
    course: AcademicCourse,
  ) {
    const confirmed =
      window.confirm(
        `¿Deseas archivar ${course.name}? La información no se eliminará.`,
      );

    if (!confirmed) {
      return;
    }

    await changeCourseStatus(
      course.id,
      "archived",
    );
  }

  async function toggleSection(
    section: AcademicSection,
  ) {
    const nextStatus =
      section.status === "active"
        ? "inactive"
        : "active";

    await changeSectionStatus(
      section.id,
      nextStatus,
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-[34rem] items-center justify-center rounded-[2rem] border border-border bg-card/75">
        <div className="text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto h-9 w-9 animate-spin text-primary"
          />

          <h1 className="mt-5 text-lg font-semibold">
            Cargando asignaturas
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sincronizando la carga académica.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,222,199,0.25),transparent_33%),radial-gradient(circle_at_88%_88%,rgba(117,104,255,0.23),transparent_35%)]"
        />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#62ead8]">
              <BookOpen
                aria-hidden="true"
                className="h-4 w-4"
              />

              Gestión académica
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Asignaturas y secciones
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Organiza materias, períodos,
              horarios, modalidades y secciones
              desde un entorno centralizado.
            </p>

            <button
              type="button"
              onClick={() => {
                setCourseDialog({
                  mode: "create",
                });
              }}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/15"
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4"
              />

              Crear asignatura
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <HeroMetric
              value={activeCourses}
              label="Activas"
            />

            <HeroMetric
              value={activeSections}
              label="Secciones"
            />

            <HeroMetric
              value={totalCapacity}
              label="Cupos"
            />
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </section>
      )}

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
            placeholder="Buscar por nombre, código, área o período"
            className="h-12 w-full rounded-2xl border border-border bg-background/70 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {(
            [
              "all",
              "active",
              "draft",
              "archived",
            ] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
              }}
              className={cn(
                "min-h-11 shrink-0 rounded-2xl border px-4 text-xs font-semibold transition-all",
                statusFilter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/60 text-muted-foreground hover:border-primary/30",
              )}
            >
              {status === "all"
                ? "Todas"
                : statusLabels[status]}
            </button>
          ))}
        </div>
      </section>

      {courses.length === 0 ? (
        <EmptyCourses
          onCreate={() => {
            setCourseDialog({
              mode: "create",
            });
          }}
        />
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(23rem,0.75fr)]">
          <div>
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredCourses.map(
                (course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    sectionCount={
                      sections.filter(
                        (section) =>
                          section.courseId ===
                          course.id,
                      ).length
                    }
                    selected={
                      selectedCourse?.id ===
                      course.id
                    }
                    saving={saving}
                    onSelect={() => {
                      setSelectedCourseId(
                        course.id,
                      );
                    }}
                    onEdit={() => {
                      setCourseDialog({
                        mode: "edit",
                        course,
                      });
                    }}
                    onArchive={() => {
                      void archiveCourse(
                        course,
                      );
                    }}
                    onReactivate={() => {
                      void changeCourseStatus(
                        course.id,
                        "active",
                      );
                    }}
                  />
                ),
              )}
            </div>

            {filteredCourses.length ===
              0 && (
              <div className="flex min-h-72 items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
                <div>
                  <Search
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-primary"
                  />

                  <h2 className="mt-4 text-lg font-semibold">
                    No encontramos asignaturas
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Cambia el término de búsqueda o
                    el filtro seleccionado.
                  </p>
                </div>
              </div>
            )}
          </div>

          <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
            {selectedCourse ? (
              <CourseDetail
                course={selectedCourse}
                sections={selectedSections}
                saving={saving}
                onEditCourse={() => {
                  setCourseDialog({
                    mode: "edit",
                    course: selectedCourse,
                  });
                }}
                onAddSection={() => {
                  setSectionDialog({
                    course: selectedCourse,
                  });
                }}
                onEditSection={(section) => {
                  setSectionDialog({
                    course: selectedCourse,
                    section,
                  });
                }}
                onToggleSection={(section) => {
                  void toggleSection(
                    section,
                  );
                }}
              />
            ) : null}
          </aside>
        </section>
      )}

      {courseDialog && (
        <CourseDialog
          key={
            courseDialog.mode === "edit"
              ? courseDialog.course.id
              : "new-course"
          }
          mode={courseDialog.mode}
          course={
            courseDialog.mode === "edit"
              ? courseDialog.course
              : undefined
          }
          saving={saving}
          onClose={() => {
            setCourseDialog(null);
          }}
          onCreate={async (input) => {
            const courseId =
              await createCourse(input);

            if (courseId) {
              setSelectedCourseId(
                courseId,
              );
            }

            return courseId;
          }}
          onUpdate={editCourse}
        />
      )}

      {sectionDialog && (
        <SectionDialog
          key={
            sectionDialog.section?.id ??
            `new-${sectionDialog.course.id}`
          }
          course={sectionDialog.course}
          section={sectionDialog.section}
          saving={saving}
          onClose={() => {
            setSectionDialog(null);
          }}
          onCreate={createSection}
          onUpdate={editSection}
        />
      )}
    </div>
  );
}

interface CourseCardProps {
  course: AcademicCourse;
  sectionCount: number;
  selected: boolean;
  saving: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onReactivate: () => void;
}

function CourseCard({
  course,
  sectionCount,
  selected,
  saving,
  onSelect,
  onEdit,
  onArchive,
  onReactivate,
}: CourseCardProps) {
  const tone = toneStyles[course.tone];

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.8rem] border bg-card/75 shadow-sm transition-all",
        selected
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br p-5 text-white",
            tone.background,
          )}
        >
          <div
            aria-hidden="true"
            className={cn(
              "absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl",
              tone.glow,
            )}
          />

          <div className="relative z-10">
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

              <CourseStatusBadge
                status={course.status}
              />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
              {course.code} · {course.period}
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {course.name}
            </h2>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">
              {course.description ||
                "Asignatura académica sin descripción."}
            </p>
          </div>
        </div>
      </button>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <CardMetric
            value={sectionCount}
            label="Secciones"
          />

          <CardMetric
            value={course.studentsCount}
            label="Estudiantes"
          />

          <CardMetric
            value={course.area}
            label="Área"
            compact
          />
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onEdit}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-foreground"
          >
            <Edit3
              aria-hidden="true"
              className="h-4 w-4"
            />

            Editar
          </button>

          {course.status ===
          "archived" ? (
            <button
              type="button"
              disabled={saving}
              onClick={onReactivate}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary text-xs font-semibold text-primary-foreground"
            >
              <RotateCcw
                aria-hidden="true"
                className="h-4 w-4"
              />

              Reactivar
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={onArchive}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-muted-foreground hover:border-danger/30 hover:text-danger"
            >
              <Archive
                aria-hidden="true"
                className="h-4 w-4"
              />

              Archivar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

interface CourseDetailProps {
  course: AcademicCourse;
  sections: AcademicSection[];
  saving: boolean;
  onEditCourse: () => void;
  onAddSection: () => void;
  onEditSection: (
    section: AcademicSection,
  ) => void;
  onToggleSection: (
    section: AcademicSection,
  ) => void;
}

function CourseDetail({
  course,
  sections,
  saving,
  onEditCourse,
  onAddSection,
  onEditSection,
  onToggleSection,
}: CourseDetailProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <header className="border-b border-border p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {course.code}
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {course.name}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {course.period} · {course.area}
            </p>
          </div>

          <button
            type="button"
            onClick={onEditCourse}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground"
            aria-label="Editar asignatura"
          >
            <Edit3
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        </div>

        <button
          type="button"
          onClick={onAddSection}
          className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Agregar sección
        </button>
      </header>

      <div className="max-h-[42rem] overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
              Secciones
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {sections.length} registradas
            </p>
          </div>

          <Layers3
            aria-hidden="true"
            className="h-5 w-5 text-muted-foreground"
          />
        </div>

        {sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((section) => {
              const ModalityIcon =
                getModalityIcon(
                  section.modality,
                );

              return (
                <article
                  key={section.id}
                  className={cn(
                    "rounded-[1.4rem] border p-4",
                    section.status ===
                      "active"
                      ? "border-border bg-background/60"
                      : "border-border bg-muted/40 opacity-70",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-foreground">
                      {section.code}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">
                          Sección {section.code}
                        </h3>

                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold",
                            section.status ===
                              "active"
                              ? "border-primary/20 bg-secondary text-secondary-foreground"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {section.status ===
                          "active"
                            ? "Activa"
                            : "Inactiva"}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Clock3
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-primary"
                          />

                          {formatSchedule(
                            section,
                          )}
                        </p>

                        <p className="flex items-center gap-2">
                          <ModalityIcon
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-primary"
                          />

                          {
                            modalityLabels[
                              section.modality
                            ]
                          }
                        </p>

                        <p className="flex items-center gap-2">
                          <MapPin
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-primary"
                          />

                          {section.classroom ||
                            "Sin aula asignada"}
                        </p>

                        <p className="flex items-center gap-2">
                          <Users
                            aria-hidden="true"
                            className="h-3.5 w-3.5 text-primary"
                          />

                          Capacidad:{" "}
                          {section.capacity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        onEditSection(
                          section,
                        );
                      }}
                      className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground"
                    >
                      <Edit3
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />

                      Editar
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        onToggleSection(
                          section,
                        );
                      }}
                      className={cn(
                        "flex min-h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold",
                        section.status ===
                          "active"
                          ? "border-danger/20 bg-danger/5 text-danger"
                          : "border-primary/20 bg-secondary text-secondary-foreground",
                      )}
                    >
                      {section.status ===
                      "active" ? (
                        <>
                          <XCircle
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />

                          Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />

                          Activar
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border p-6 text-center">
            <CalendarDays
              aria-hidden="true"
              className="mx-auto h-7 w-7 text-primary"
            />

            <h3 className="mt-4 text-sm font-semibold">
              Sin secciones
            </h3>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Agrega una sección para configurar
              horarios y modalidad.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

interface EmptyCoursesProps {
  onCreate: () => void;
}

function EmptyCourses({
  onCreate,
}: EmptyCoursesProps) {
  return (
    <section className="flex min-h-[28rem] items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-secondary text-secondary-foreground">
          <BookOpen
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          Crea tu primera asignatura
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Registra una materia y su sección inicial
          para comenzar la gestión académica.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Crear asignatura
        </button>
      </div>
    </section>
  );
}

function CourseStatusBadge({
  status,
}: {
  status: AcademicCourseStatus;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1.5 text-[0.65rem] font-semibold",
        status === "active" &&
          "border-[#59e4d2]/25 bg-[#59e4d2]/15 text-[#8ff2e4]",
        status === "draft" &&
          "border-[#ffd581]/25 bg-[#ffd581]/15 text-[#ffe2a9]",
        status === "archived" &&
          "border-white/10 bg-white/[0.06] text-white/55",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

interface HeroMetricProps {
  value: string | number;
  label: string;
}

function HeroMetric({
  value,
  label,
}: HeroMetricProps) {
  return (
    <div className="min-w-24 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-xl">
      <p className="text-xl font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.65rem] text-white/45">
        {label}
      </p>
    </div>
  );
}

interface CardMetricProps {
  value: string | number;
  label: string;
  compact?: boolean;
}

function CardMetric({
  value,
  label,
  compact,
}: CardMetricProps) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/60 p-3 text-center">
      <p
        className={cn(
          "font-semibold",
          compact
            ? "truncate text-xs"
            : "text-sm",
        )}
        title={String(value)}
      >
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}