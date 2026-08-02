"use client";

import type {
  LucideIcon,
} from "lucide-react";
import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { TeacherAssessmentDialog } from "@/components/teacher/teacher-assessment-dialog";
import { useTeacherAssessments } from "@/hooks/use-teacher-assessments";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicSection,
} from "@/types/academic-course";
import type {
  TeacherAssessment,
  TeacherAssessmentStatus,
  TeacherAssessmentType,
} from "@/types/teacher-assessment";

type AssessmentStatusFilter =
  | "all"
  | TeacherAssessmentStatus;

type AssessmentTypeFilter =
  | "all"
  | TeacherAssessmentType;

const statusLabels: Record<
  TeacherAssessmentStatus,
  string
> = {
  draft: "Borrador",
  scheduled: "Programada",
  open: "Abierta",
  closed: "Cerrada",
  graded: "Calificada",
  archived: "Archivada",
};

const typeLabels: Record<
  TeacherAssessmentType,
  string
> = {
  exam: "Examen",
  quiz: "Cuestionario",
  workshop: "Taller",
  project: "Proyecto",
  presentation: "Exposición",
  practice: "Práctica",
  assignment: "Tarea",
};

const statusIcons: Record<
  TeacherAssessmentStatus,
  LucideIcon
> = {
  draft: FileText,
  scheduled: CalendarDays,
  open: PlayCircle,
  closed: LockKeyhole,
  graded: Trophy,
  archived: Archive,
};

function formatDateTime(
  value: string,
) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-VE",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export function TeacherAssessmentManager() {
  const {
    courses,
    sections,
    loading: coursesLoading,
  } = useTeacherCourses();

  const {
    assessments,
    loading: assessmentsLoading,
    saving,
    error,
    createAssessment,
    editAssessment,
    changeStatus,
    changeVisibility,
    duplicateAssessment,
    getScopeWeight,
  } = useTeacherAssessments();

  const [search, setSearch] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState<AssessmentStatusFilter>(
      "all",
    );

  const [typeFilter, setTypeFilter] =
    useState<AssessmentTypeFilter>(
      "all",
    );

  const [
    selectedAssessmentId,
    setSelectedAssessmentId,
  ] = useState<string | null>(null);

  const [
    dialogAssessment,
    setDialogAssessment,
  ] = useState<
    TeacherAssessment | "create" | null
  >(null);

  const loading =
    coursesLoading ||
    assessmentsLoading;

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredAssessments =
    assessments.filter(
      (assessment) => {
        const course = courses.find(
          (item) =>
            item.id ===
            assessment.courseId,
        );

        const searchableText = [
          assessment.title,
          assessment.description,
          typeLabels[assessment.type],
          course?.name ?? "",
          course?.code ?? "",
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(
            normalizedSearch,
          );

        const matchesCourse =
          courseFilter === "all" ||
          assessment.courseId ===
            courseFilter;

        const matchesStatus =
          statusFilter === "all" ||
          assessment.status ===
            statusFilter;

        const matchesType =
          typeFilter === "all" ||
          assessment.type === typeFilter;

        return (
          matchesSearch &&
          matchesCourse &&
          matchesStatus &&
          matchesType
        );
      },
    );

  const selectedAssessment =
    filteredAssessments.find(
      (assessment) =>
        assessment.id ===
        selectedAssessmentId,
    ) ??
    filteredAssessments[0] ??
    null;

  const activeCourses =
    courses.filter(
      (course) =>
        course.status === "active",
    );

  const openCount =
    assessments.filter(
      (assessment) =>
        assessment.status === "open",
    ).length;

  const scheduledCount =
    assessments.filter(
      (assessment) =>
        assessment.status ===
        "scheduled",
    ).length;

  const gradedCount =
    assessments.filter(
      (assessment) =>
        assessment.status ===
        "graded",
    ).length;

  const visibleCount =
    assessments.filter(
      (assessment) =>
        assessment.visibleToStudents,
    ).length;

  function findCourse(
    courseId: string,
  ): AcademicCourse | undefined {
    return courses.find(
      (course) =>
        course.id === courseId,
    );
  }

  function findSection(
    sectionId: string | null,
  ): AcademicSection | undefined {
    if (!sectionId) {
      return undefined;
    }

    return sections.find(
      (section) =>
        section.id === sectionId,
    );
  }

  async function archiveAssessment(
    assessment: TeacherAssessment,
  ) {
    const confirmed =
      window.confirm(
        `¿Deseas archivar la evaluación "${assessment.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    await changeStatus(
      assessment.id,
      "archived",
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
            Cargando evaluaciones
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sincronizando actividades y
            rúbricas.
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
              <ClipboardCheck
                aria-hidden="true"
                className="h-4 w-4"
              />

              Gestión evaluativa
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Evaluaciones y rúbricas
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Diseña actividades, configura
              ponderaciones y define criterios
              claros para evaluar a tus
              estudiantes.
            </p>

            <button
              type="button"
              disabled={
                activeCourses.length === 0
              }
              onClick={() => {
                setDialogAssessment(
                  "create",
                );
              }}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/15 disabled:pointer-events-none disabled:opacity-45"
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4"
              />

              Crear evaluación
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <HeroMetric
              value={scheduledCount}
              label="Programadas"
            />

            <HeroMetric
              value={openCount}
              label="Abiertas"
            />

            <HeroMetric
              value={gradedCount}
              label="Calificadas"
            />

            <HeroMetric
              value={visibleCount}
              label="Visibles"
            />
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </section>
      )}

      {activeCourses.length === 0 && (
        <section className="rounded-2xl border border-[#dfa93b]/25 bg-[#fff4d4] p-4 text-sm text-[#745008] dark:bg-[#433116] dark:text-[#ffda8a]">
          Debes crear al menos una
          asignatura activa antes de registrar
          evaluaciones.
        </section>
      )}

      <section className="grid gap-3 rounded-[1.7rem] border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xl lg:grid-cols-[minmax(18rem,1fr)_repeat(3,minmax(10rem,0.3fr))]">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value,
              );
            }}
            placeholder="Buscar por evaluación, materia o tipo"
            className="h-12 w-full rounded-2xl border border-border bg-background/70 pl-11 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(event) => {
            setCourseFilter(
              event.target.value,
            );
          }}
          className={filterClassName}
        >
          <option value="all">
            Todas las asignaturas
          </option>

          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.code}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(
              event.target
                .value as AssessmentTypeFilter,
            );
          }}
          className={filterClassName}
        >
          <option value="all">
            Todos los tipos
          </option>

          {Object.entries(
            typeLabels,
          ).map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(
              event.target
                .value as AssessmentStatusFilter,
            );
          }}
          className={filterClassName}
        >
          <option value="all">
            Todos los estados
          </option>

          {Object.entries(
            statusLabels,
          ).map(([value, label]) => (
            <option
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </select>
      </section>

      {assessments.length === 0 ? (
        <EmptyAssessments
          disabled={
            activeCourses.length === 0
          }
          onCreate={() => {
            setDialogAssessment(
              "create",
            );
          }}
        />
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(23rem,0.75fr)]">
          <div>
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredAssessments.map(
                (assessment) => (
                  <AssessmentCard
                    key={assessment.id}
                    assessment={assessment}
                    course={findCourse(
                      assessment.courseId,
                    )}
                    section={findSection(
                      assessment.sectionId,
                    )}
                    selected={
                      selectedAssessment?.id ===
                      assessment.id
                    }
                    saving={saving}
                    onSelect={() => {
                      setSelectedAssessmentId(
                        assessment.id,
                      );
                    }}
                    onEdit={() => {
                      setDialogAssessment(
                        assessment,
                      );
                    }}
                    onDuplicate={() => {
                      void duplicateAssessment(
                        assessment,
                      );
                    }}
                  />
                ),
              )}
            </div>

            {filteredAssessments.length ===
              0 && (
              <section className="flex min-h-72 items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
                <div>
                  <Search
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-primary"
                  />

                  <h2 className="mt-4 text-lg font-semibold">
                    No encontramos evaluaciones
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Cambia la búsqueda o los
                    filtros seleccionados.
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
            {selectedAssessment && (
              <AssessmentDetail
                assessment={
                  selectedAssessment
                }
                course={findCourse(
                  selectedAssessment.courseId,
                )}
                section={findSection(
                  selectedAssessment.sectionId,
                )}
                saving={saving}
                onEdit={() => {
                  setDialogAssessment(
                    selectedAssessment,
                  );
                }}
                onStatusChange={(status) => {
                  void changeStatus(
                    selectedAssessment.id,
                    status,
                  );
                }}
                onVisibilityChange={() => {
                  void changeVisibility(
                    selectedAssessment.id,
                    !selectedAssessment.visibleToStudents,
                  );
                }}
                onDuplicate={() => {
                  void duplicateAssessment(
                    selectedAssessment,
                  );
                }}
                onArchive={() => {
                  void archiveAssessment(
                    selectedAssessment,
                  );
                }}
              />
            )}
          </aside>
        </section>
      )}

      {dialogAssessment && (
        <TeacherAssessmentDialog
          key={
            dialogAssessment === "create"
              ? "new-assessment"
              : dialogAssessment.id
          }
          assessment={
            dialogAssessment === "create"
              ? undefined
              : dialogAssessment
          }
          courses={courses}
          sections={sections}
          saving={saving}
          getScopeWeight={
            getScopeWeight
          }
          onClose={() => {
            setDialogAssessment(null);
          }}
          onCreate={async (values) => {
            const assessmentId =
              await createAssessment(
                values,
              );

            if (assessmentId) {
              setSelectedAssessmentId(
                assessmentId,
              );
            }

            return assessmentId;
          }}
          onUpdate={editAssessment}
        />
      )}
    </div>
  );
}

interface AssessmentCardProps {
  assessment: TeacherAssessment;
  course?: AcademicCourse;
  section?: AcademicSection;
  selected: boolean;
  saving: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

function AssessmentCard({
  assessment,
  course,
  section,
  selected,
  saving,
  onSelect,
  onEdit,
  onDuplicate,
}: AssessmentCardProps) {
  const StatusIcon =
    statusIcons[assessment.status];

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
        <div className="relative overflow-hidden bg-[#071a22] p-5 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(45,222,199,0.22),transparent_36%),radial-gradient(circle_at_85%_85%,rgba(117,104,255,0.2),transparent_38%)]"
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#59e4d2] text-[#05231f]">
                <StatusIcon
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <AssessmentStatusBadge
                  status={
                    assessment.status
                  }
                  dark
                />

                {assessment.visibleToStudents && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#59e4d2]/20 bg-[#59e4d2]/10 px-2.5 py-1 text-[0.62rem] font-semibold text-[#8ff2e4]">
                    <Eye
                      aria-hidden="true"
                      className="h-3 w-3"
                    />

                    Visible
                  </span>
                )}
              </div>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-[#62ead8]">
              {course?.code ??
                "Sin asignatura"}{" "}
              ·{" "}
              {section
                ? `Sección ${section.code}`
                : "Todas las secciones"}
            </p>

            <h2 className="mt-2 line-clamp-2 text-xl font-semibold">
              {assessment.title}
            </h2>

            <p className="mt-3 text-sm text-white/55">
              {
                typeLabels[
                  assessment.type
                ]
              }{" "}
              ·{" "}
              {assessment.deliveryMode ===
              "online"
                ? "En línea"
                : "Manual"}
            </p>
          </div>
        </div>
      </button>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <CardMetric
            value={`${assessment.weightPercentage}%`}
            label="Ponderación"
          />

          <CardMetric
            value={`${assessment.maxScore} pts`}
            label="Nota máxima"
          />

          <CardMetric
            value={`${assessment.durationMinutes} min`}
            label="Duración"
          />
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3
            aria-hidden="true"
            className="h-4 w-4 text-primary"
          />

          {formatDateTime(
            assessment.opensAt,
          )}
        </p>

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

          <button
            type="button"
            disabled={saving}
            onClick={onDuplicate}
            className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-foreground"
          >
            <Copy
              aria-hidden="true"
              className="h-4 w-4"
            />

            Duplicar
          </button>
        </div>
      </div>
    </article>
  );
}

interface AssessmentDetailProps {
  assessment: TeacherAssessment;
  course?: AcademicCourse;
  section?: AcademicSection;
  saving: boolean;
  onEdit: () => void;
  onStatusChange: (
    status: TeacherAssessmentStatus,
  ) => void;
  onVisibilityChange: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

function AssessmentDetail({
  assessment,
  course,
  section,
  saving,
  onEdit,
  onStatusChange,
  onVisibilityChange,
  onDuplicate,
  onArchive,
}: AssessmentDetailProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <header className="border-b border-border p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ClipboardCheck
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {course?.code ??
                "Evaluación"}
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {assessment.title}
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              {section
                ? `Sección ${section.code}`
                : "Todas las secciones"}
            </p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground"
            aria-label="Editar evaluación"
          >
            <Edit3
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <AssessmentStatusBadge
            status={assessment.status}
          />

          <button
            type="button"
            disabled={
              saving ||
              assessment.status ===
                "archived"
            }
            onClick={
              onVisibilityChange
            }
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold",
              assessment.visibleToStudents
                ? "border-primary/20 bg-secondary text-secondary-foreground"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {assessment.visibleToStudents ? (
              <Eye
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            ) : (
              <EyeOff
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />
            )}

            {assessment.visibleToStudents
              ? "Visible"
              : "Oculta"}
          </button>
        </div>
      </header>

      <div className="max-h-[55rem] overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <DetailMetric
            icon={Target}
            label="Ponderación"
            value={`${assessment.weightPercentage}%`}
          />

          <DetailMetric
            icon={Trophy}
            label="Calificación"
            value={`${assessment.passingScore}/${assessment.maxScore}`}
          />

          <DetailMetric
            icon={Timer}
            label="Duración"
            value={`${assessment.durationMinutes} min`}
          />

          <DetailMetric
            icon={FileCheck2}
            label="Intentos"
            value={`${assessment.attemptsAllowed}`}
          />
        </div>

        <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Fechas
          </p>

          <div className="mt-4 space-y-3">
            <DateInformation
              label="Apertura"
              value={formatDateTime(
                assessment.opensAt,
              )}
            />

            <DateInformation
              label="Cierre"
              value={formatDateTime(
                assessment.closesAt,
              )}
            />
          </div>
        </section>

        {assessment.description && (
          <TextSection
            title="Descripción"
            content={
              assessment.description
            }
          />
        )}

        {assessment.instructions && (
          <TextSection
            title="Instrucciones"
            content={
              assessment.instructions
            }
          />
        )}

        <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Rúbrica
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  assessment.rubric
                    .length
                }{" "}
                criterio(s)
              </p>
            </div>

            <span className="text-sm font-semibold text-primary">
              {assessment.rubric.reduce(
                (total, criterion) =>
                  total +
                  criterion.points,
                0,
              )}{" "}
              pts
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {assessment.rubric.map(
              (criterion, index) => (
                <article
                  key={criterion.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-[0.65rem] font-bold text-secondary-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">
                      {criterion.title}
                    </p>

                    {criterion.description && (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {
                          criterion.description
                        }
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {criterion.points} pts
                  </span>
                </article>
              ),
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-2">
          {assessment.status ===
            "draft" && (
            <ActionButton
              icon={CalendarDays}
              label="Programar evaluación"
              disabled={saving}
              onClick={() => {
                onStatusChange(
                  "scheduled",
                );
              }}
            />
          )}

          {assessment.status ===
            "scheduled" && (
            <ActionButton
              icon={PlayCircle}
              label="Abrir evaluación"
              disabled={saving}
              onClick={() => {
                onStatusChange("open");
              }}
            />
          )}

          {assessment.status ===
            "open" && (
            <ActionButton
              icon={LockKeyhole}
              label="Cerrar evaluación"
              disabled={saving}
              onClick={() => {
                onStatusChange(
                  "closed",
                );
              }}
            />
          )}

          {assessment.status ===
            "closed" && (
            <ActionButton
              icon={CheckCircle2}
              label="Marcar como calificada"
              disabled={saving}
              onClick={() => {
                onStatusChange(
                  "graded",
                );
              }}
            />
          )}

          {assessment.status ===
            "archived" && (
            <ActionButton
              icon={RotateCcw}
              label="Restaurar como borrador"
              disabled={saving}
              onClick={() => {
                onStatusChange("draft");
              }}
            />
          )}

          <button
            type="button"
            disabled={saving}
            onClick={onDuplicate}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-4 text-sm font-semibold text-muted-foreground"
          >
            <Copy
              aria-hidden="true"
              className="h-4 w-4"
            />

            Duplicar evaluación
          </button>

          {assessment.status !==
            "archived" && (
            <button
              type="button"
              disabled={saving}
              onClick={onArchive}
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-4 text-sm font-semibold text-danger"
            >
              <Archive
                aria-hidden="true"
                className="h-4 w-4"
              />

              Archivar evaluación
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function DateInformation({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <CalendarDays
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-primary"
      />

      <div>
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-xs font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

function TextSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {title}
      </p>

      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
        {content}
      </p>
    </section>
  );
}

function DetailMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <Icon
        aria-hidden="true"
        className="h-4 w-4 text-primary"
      />

      <p className="mt-3 truncate text-xs font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4"
      />

      {label}
    </button>
  );
}

function AssessmentStatusBadge({
  status,
  dark = false,
}: {
  status: TeacherAssessmentStatus;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold",
        status === "draft" &&
          (dark
            ? "border-white/10 bg-white/[0.06] text-white/60"
            : "border-border bg-muted text-muted-foreground"),
        status === "scheduled" &&
          "border-[#e3ae40]/25 bg-[#e3ae40]/15 text-[#c1840a]",
        status === "open" &&
          "border-primary/20 bg-secondary text-secondary-foreground",
        status === "closed" &&
          "border-[#9a83e7]/25 bg-[#9a83e7]/15 text-[#765dc9]",
        status === "graded" &&
          "border-[#45c89d]/25 bg-[#45c89d]/15 text-[#188b68]",
        status === "archived" &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function EmptyAssessments({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: () => void;
}) {
  return (
    <section className="flex min-h-[28rem] items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-secondary text-secondary-foreground">
          <ClipboardCheck
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          Crea tu primera evaluación
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Define una actividad, su
          ponderación, fechas y criterios
          de evaluación.
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={onCreate}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-45"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Crear evaluación
        </button>
      </div>
    </section>
  );
}

function HeroMetric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
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

function CardMetric({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/60 p-3 text-center">
      <p className="truncate text-sm font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

const filterClassName =
  "h-12 rounded-2xl border border-border bg-background/70 px-4 text-xs font-semibold text-muted-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10";