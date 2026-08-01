"use client";

import type {
  LucideIcon,
} from "lucide-react";
import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Layers3,
  LoaderCircle,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Timer,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TeacherPlanningDialog } from "@/components/teacher/teacher-planning-dialog";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherPlans } from "@/hooks/use-teacher-plans";
import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicSection,
} from "@/types/academic-course";
import type {
  LessonPlanStatus,
  TeacherLessonPlan,
} from "@/types/teacher-planning";

type PlanStatusFilter =
  | "all"
  | LessonPlanStatus;

const statusLabels: Record<
  LessonPlanStatus,
  string
> = {
  draft: "Borrador",
  scheduled: "Programada",
  "in-progress": "En progreso",
  completed: "Completada",
  archived: "Archivada",
};

const statusIcons: Record<
  LessonPlanStatus,
  LucideIcon
> = {
  draft: FileText,
  scheduled: CalendarDays,
  "in-progress": PlayCircle,
  completed: CheckCircle2,
  archived: Archive,
};

function formatDate(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat(
    "es-VE",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(`${value}T12:00:00`),
  );
}

export function TeacherPlanningManager() {
  const {
    courses,
    sections,
    loading: coursesLoading,
  } = useTeacherCourses();

  const {
    plans,
    loading: plansLoading,
    saving,
    error,
    createPlan,
    editPlan,
    changeStatus,
    changeVisibility,
    duplicatePlan,
  } = useTeacherPlans();

  const [search, setSearch] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState<PlanStatusFilter>("all");

  const [
    selectedPlanId,
    setSelectedPlanId,
  ] = useState<string | null>(null);

  const [dialogPlan, setDialogPlan] =
    useState<
      TeacherLessonPlan | "create" | null
    >(null);

  const loading =
    coursesLoading || plansLoading;

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredPlans = plans.filter(
    (plan) => {
      const course = courses.find(
        (item) =>
          item.id === plan.courseId,
      );

      const searchableText = [
        plan.title,
        plan.unit,
        plan.weekLabel,
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
        plan.courseId === courseFilter;

      const matchesStatus =
        statusFilter === "all" ||
        plan.status === statusFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesStatus
      );
    },
  );

  const selectedPlan =
    filteredPlans.find(
      (plan) =>
        plan.id === selectedPlanId,
    ) ??
    filteredPlans[0] ??
    null;

  const activeCourses = courses.filter(
    (course) =>
      course.status === "active",
  );

  const scheduledCount = plans.filter(
    (plan) =>
      plan.status === "scheduled",
  ).length;

  const inProgressCount = plans.filter(
    (plan) =>
      plan.status ===
      "in-progress",
  ).length;

  const completedCount = plans.filter(
    (plan) =>
      plan.status === "completed",
  ).length;

  const visibleCount = plans.filter(
    (plan) =>
      plan.visibleToStudents,
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

  async function archivePlan(
    plan: TeacherLessonPlan,
  ) {
    const confirmed =
      window.confirm(
        `¿Deseas archivar la planificación "${plan.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    await changeStatus(
      plan.id,
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
            Cargando planificaciones
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sincronizando los planes docentes.
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
              <FileText
                aria-hidden="true"
                className="h-4 w-4"
              />

              Organización docente
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Planificación académica
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Organiza objetivos, contenidos,
              estrategias, recursos y actividades
              para cada asignatura.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                disabled={
                  activeCourses.length ===
                  0
                }
                onClick={() => {
                  setDialogPlan("create");
                }}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/15 disabled:pointer-events-none disabled:opacity-45"
              >
                <Plus
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Crear planificación
              </button>

              <Link
                href="/teacher/ai"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-5 text-sm font-semibold text-white"
              >
                <WandSparkles
                  aria-hidden="true"
                  className="h-4 w-4 text-[#62ead8]"
                />

                Generar con IA
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <HeroMetric
              value={scheduledCount}
              label="Programadas"
            />

            <HeroMetric
              value={inProgressCount}
              label="En progreso"
            />

            <HeroMetric
              value={completedCount}
              label="Completadas"
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
          Debes crear al menos una asignatura activa antes de registrar planificaciones.
        </section>
      )}

      <section className="grid gap-3 rounded-[1.7rem] border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xl lg:grid-cols-[minmax(18rem,1fr)_minmax(12rem,0.35fr)_minmax(12rem,0.35fr)]">
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
            placeholder="Buscar por título, unidad o materia"
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
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(
              event.target
                .value as PlanStatusFilter,
            );
          }}
          className={filterClassName}
        >
          <option value="all">
            Todos los estados
          </option>

          <option value="draft">
            Borradores
          </option>

          <option value="scheduled">
            Programadas
          </option>

          <option value="in-progress">
            En progreso
          </option>

          <option value="completed">
            Completadas
          </option>

          <option value="archived">
            Archivadas
          </option>
        </select>
      </section>

      {plans.length === 0 ? (
        <EmptyPlanning
          disabled={
            activeCourses.length === 0
          }
          onCreate={() => {
            setDialogPlan("create");
          }}
        />
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(23rem,0.75fr)]">
          <div>
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredPlans.map(
                (plan) => (
                  <PlanningCard
                    key={plan.id}
                    plan={plan}
                    course={findCourse(
                      plan.courseId,
                    )}
                    section={findSection(
                      plan.sectionId,
                    )}
                    selected={
                      selectedPlan?.id ===
                      plan.id
                    }
                    saving={saving}
                    onSelect={() => {
                      setSelectedPlanId(
                        plan.id,
                      );
                    }}
                    onEdit={() => {
                      setDialogPlan(plan);
                    }}
                    onDuplicate={() => {
                      void duplicatePlan(
                        plan,
                      );
                    }}
                  />
                ),
              )}
            </div>

            {filteredPlans.length ===
              0 && (
              <section className="flex min-h-72 items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
                <div>
                  <Search
                    aria-hidden="true"
                    className="mx-auto h-7 w-7 text-primary"
                  />

                  <h2 className="mt-4 text-lg font-semibold">
                    No encontramos planificaciones
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Cambia el término de búsqueda o los filtros.
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
            {selectedPlan && (
              <PlanningDetail
                plan={selectedPlan}
                course={findCourse(
                  selectedPlan.courseId,
                )}
                section={findSection(
                  selectedPlan.sectionId,
                )}
                saving={saving}
                onEdit={() => {
                  setDialogPlan(
                    selectedPlan,
                  );
                }}
                onStatusChange={(status) => {
                  void changeStatus(
                    selectedPlan.id,
                    status,
                  );
                }}
                onVisibilityChange={() => {
                  void changeVisibility(
                    selectedPlan.id,
                    !selectedPlan.visibleToStudents,
                  );
                }}
                onDuplicate={() => {
                  void duplicatePlan(
                    selectedPlan,
                  );
                }}
                onArchive={() => {
                  void archivePlan(
                    selectedPlan,
                  );
                }}
              />
            )}
          </aside>
        </section>
      )}

      {dialogPlan && (
        <TeacherPlanningDialog
          key={
            dialogPlan === "create"
              ? "new-plan"
              : dialogPlan.id
          }
          plan={
            dialogPlan === "create"
              ? undefined
              : dialogPlan
          }
          courses={courses}
          sections={sections}
          saving={saving}
          onClose={() => {
            setDialogPlan(null);
          }}
          onCreate={async (values) => {
            const planId =
              await createPlan(values);

            if (planId) {
              setSelectedPlanId(
                planId,
              );
            }

            return planId;
          }}
          onUpdate={editPlan}
        />
      )}
    </div>
  );
}

interface PlanningCardProps {
  plan: TeacherLessonPlan;
  course?: AcademicCourse;
  section?: AcademicSection;
  selected: boolean;
  saving: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
}

function PlanningCard({
  plan,
  course,
  section,
  selected,
  saving,
  onSelect,
  onEdit,
  onDuplicate,
}: PlanningCardProps) {
  const StatusIcon =
    statusIcons[plan.status];

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
                <PlanStatusBadge
                  status={plan.status}
                  dark
                />

                {plan.visibleToStudents && (
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
              {plan.title}
            </h2>

            <p className="mt-3 text-sm text-white/55">
              {plan.unit}
              {plan.weekLabel
                ? ` · ${plan.weekLabel}`
                : ""}
            </p>
          </div>
        </div>
      </button>

      <div className="p-5">
        <div className="grid grid-cols-3 gap-3">
          <CardMetric
            value={formatDate(
              plan.startDate,
            )}
            label="Inicio"
            compact
          />

          <CardMetric
            value={`${plan.estimatedMinutes} min`}
            label="Duración"
          />

          <CardMetric
            value={plan.activities.length}
            label="Actividades"
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

interface PlanningDetailProps {
  plan: TeacherLessonPlan;
  course?: AcademicCourse;
  section?: AcademicSection;
  saving: boolean;
  onEdit: () => void;
  onStatusChange: (
    status: LessonPlanStatus,
  ) => void;
  onVisibilityChange: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
}

function PlanningDetail({
  plan,
  course,
  section,
  saving,
  onEdit,
  onStatusChange,
  onVisibilityChange,
  onDuplicate,
  onArchive,
}: PlanningDetailProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <header className="border-b border-border p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <FileText
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {course?.code ??
                "Planificación"}
            </p>

            <h2 className="mt-2 text-lg font-semibold">
              {plan.title}
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
            aria-label="Editar planificación"
          >
            <Edit3
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <PlanStatusBadge
            status={plan.status}
          />

          <button
            type="button"
            disabled={
              saving ||
              plan.status === "archived"
            }
            onClick={
              onVisibilityChange
            }
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold",
              plan.visibleToStudents
                ? "border-primary/20 bg-secondary text-secondary-foreground"
                : "border-border bg-background text-muted-foreground",
            )}
          >
            {plan.visibleToStudents ? (
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

            {plan.visibleToStudents
              ? "Visible"
              : "Oculta"}
          </button>
        </div>
      </header>

      <div className="max-h-[52rem] overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-3">
          <DetailMetric
            icon={CalendarDays}
            label="Inicio"
            value={formatDate(
              plan.startDate,
            )}
          />

          <DetailMetric
            icon={CalendarDays}
            label="Cierre"
            value={formatDate(
              plan.endDate,
            )}
          />

          <DetailMetric
            icon={Timer}
            label="Duración"
            value={`${plan.estimatedMinutes} minutos`}
          />

          <DetailMetric
            icon={Layers3}
            label="Unidad"
            value={plan.unit}
          />
        </div>

        <PlanningList
          icon={Target}
          title="Objetivos"
          items={plan.objectives}
        />

        <PlanningList
          icon={BookOpen}
          title="Contenidos"
          items={plan.contents}
        />

        <PlanningList
          icon={Sparkles}
          title="Estrategias"
          items={plan.strategies}
        />

        <PlanningList
          icon={Layers3}
          title="Actividades"
          items={plan.activities}
        />

        <PlanningList
          icon={FileText}
          title="Recursos"
          items={plan.resources}
        />

        {plan.evaluationEvidence && (
          <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Evidencia de aprendizaje
            </p>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {
                plan.evaluationEvidence
              }
            </p>
          </section>
        )}

        <div className="mt-6 grid gap-2">
          {plan.status === "draft" && (
            <ActionButton
              icon={CalendarDays}
              label="Programar planificación"
              onClick={() => {
                onStatusChange(
                  "scheduled",
                );
              }}
            />
          )}

          {plan.status ===
            "scheduled" && (
            <ActionButton
              icon={PlayCircle}
              label="Iniciar planificación"
              onClick={() => {
                onStatusChange(
                  "in-progress",
                );
              }}
            />
          )}

          {plan.status ===
            "in-progress" && (
            <ActionButton
              icon={CheckCircle2}
              label="Marcar como completada"
              onClick={() => {
                onStatusChange(
                  "completed",
                );
              }}
            />
          )}

          {plan.status ===
            "archived" && (
            <ActionButton
              icon={RotateCcw}
              label="Restaurar como borrador"
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

            Duplicar planificación
          </button>

          {plan.status !==
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

              Archivar planificación
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function PlanningList({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
      <div className="flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className="h-4 w-4 text-primary"
        />

        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {title}
        </h3>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-secondary text-[0.65rem] font-bold text-secondary-foreground">
              {index + 1}
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
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
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4"
      />

      {label}
    </button>
  );
}

function PlanStatusBadge({
  status,
  dark = false,
}: {
  status: LessonPlanStatus;
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
          "border-[#e3ae40]/25 bg-[#e3ae40]/15 text-[#b87800]",
        status === "in-progress" &&
          "border-primary/20 bg-secondary text-secondary-foreground",
        status === "completed" &&
          "border-[#45c89d]/25 bg-[#45c89d]/15 text-[#188b68]",
        status === "archived" &&
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function EmptyPlanning({
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
          <FileText
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          Crea tu primera planificación
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Organiza objetivos, contenidos,
          estrategias, recursos y actividades
          para una clase o unidad.
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

          Crear planificación
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
  compact = false,
}: {
  value: string | number;
  label: string;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/60 p-3 text-center">
      <p
        className={cn(
          "font-semibold",
          compact
            ? "truncate text-[0.68rem]"
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

const filterClassName =
  "h-12 rounded-2xl border border-border bg-background/70 px-4 text-xs font-semibold text-muted-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10";