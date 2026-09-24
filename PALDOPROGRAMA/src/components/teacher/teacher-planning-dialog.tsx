"use client";

import type {
  LucideIcon,
} from "lucide-react";
import {
  BookOpen,
  CalendarRange,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Layers3,
  LoaderCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicSection,
} from "@/types/academic-course";
import type {
  LessonPlanFormValues,
  LessonPlanStatus,
  TeacherLessonPlan,
} from "@/types/teacher-planning";

interface TeacherPlanningDialogProps {
  plan?: TeacherLessonPlan;
  courses: AcademicCourse[];
  sections: AcademicSection[];
  saving: boolean;
  onClose: () => void;
  onCreate: (
    values: LessonPlanFormValues,
  ) => Promise<string | null>;
  onUpdate: (
    planId: string,
    values: LessonPlanFormValues,
  ) => Promise<boolean>;
}

const statusOptions: Array<{
  value: LessonPlanStatus;
  label: string;
}> = [
  {
    value: "draft",
    label: "Borrador",
  },
  {
    value: "scheduled",
    label: "Programada",
  },
  {
    value: "in-progress",
    label: "En progreso",
  },
  {
    value: "completed",
    label: "Completada",
  },
  {
    value: "archived",
    label: "Archivada",
  },
];

function itemsToText(
  values: string[] | undefined,
) {
  return values?.join("\n") ?? "";
}

function textToItems(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TeacherPlanningDialog({
  plan,
  courses,
  sections,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: TeacherPlanningDialogProps) {
  const firstCourse =
    courses.find(
      (course) =>
        course.status === "active",
    ) ?? courses[0];

  const initialCourseId =
    plan?.courseId ??
    firstCourse?.id ??
    "";

  const [courseId, setCourseId] =
    useState(initialCourseId);

  const [sectionId, setSectionId] =
    useState(
      plan?.sectionId ?? "",
    );

  const [title, setTitle] = useState(
    plan?.title ?? "",
  );

  const [unit, setUnit] = useState(
    plan?.unit ?? "",
  );

  const [weekLabel, setWeekLabel] =
    useState(
      plan?.weekLabel ?? "",
    );

  const [startDate, setStartDate] =
    useState(
      plan?.startDate ?? "",
    );

  const [endDate, setEndDate] =
    useState(
      plan?.endDate ?? "",
    );

  const [
    estimatedMinutes,
    setEstimatedMinutes,
  ] = useState(
    plan?.estimatedMinutes ?? 90,
  );

  const [objectives, setObjectives] =
    useState(
      itemsToText(
        plan?.objectives,
      ),
    );

  const [contents, setContents] =
    useState(
      itemsToText(plan?.contents),
    );

  const [strategies, setStrategies] =
    useState(
      itemsToText(
        plan?.strategies,
      ),
    );

  const [resources, setResources] =
    useState(
      itemsToText(plan?.resources),
    );

  const [activities, setActivities] =
    useState(
      itemsToText(
        plan?.activities,
      ),
    );

  const [
    evaluationEvidence,
    setEvaluationEvidence,
  ] = useState(
    plan?.evaluationEvidence ?? "",
  );

  const [notes, setNotes] =
    useState(plan?.notes ?? "");

  const [status, setStatus] =
    useState<LessonPlanStatus>(
      plan?.status ?? "draft",
    );

  const [
    visibleToStudents,
    setVisibleToStudents,
  ] = useState(
    plan?.visibleToStudents ?? false,
  );

  const [formError, setFormError] =
    useState<string | null>(null);

  const availableSections =
    sections.filter(
      (section) =>
        section.courseId ===
          courseId &&
        section.status === "active",
    );

  function changeCourse(
    nextCourseId: string,
  ) {
    setCourseId(nextCourseId);
    setSectionId("");
  }

  function validateForm() {
    if (!courseId) {
      return "Selecciona una asignatura.";
    }

    if (title.trim().length < 4) {
      return "Escribe un título para la planificación.";
    }

    if (unit.trim().length < 2) {
      return "Indica la unidad o tema principal.";
    }

    if (!startDate || !endDate) {
      return "Selecciona las fechas de la planificación.";
    }

    if (endDate < startDate) {
      return "La fecha final no puede ser anterior a la inicial.";
    }

    if (estimatedMinutes < 1) {
      return "La duración debe ser mayor que cero.";
    }

    if (
      textToItems(objectives).length ===
      0
    ) {
      return "Agrega al menos un objetivo.";
    }

    if (
      textToItems(contents).length ===
      0
    ) {
      return "Agrega al menos un contenido.";
    }

    if (
      textToItems(activities).length ===
      0
    ) {
      return "Agrega al menos una actividad.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const values:
      LessonPlanFormValues = {
        courseId,
        sectionId:
          sectionId || null,
        title,
        unit,
        weekLabel,
        startDate,
        endDate,
        estimatedMinutes,
        objectives:
          textToItems(objectives),
        contents:
          textToItems(contents),
        strategies:
          textToItems(strategies),
        resources:
          textToItems(resources),
        activities:
          textToItems(activities),
        evaluationEvidence,
        notes,
        status,
        visibleToStudents:
          status === "archived"
            ? false
            : visibleToStudents,
      };

    if (plan) {
      const updated = await onUpdate(
        plan.id,
        values,
      );

      if (updated) {
        onClose();
      }

      return;
    }

    const createdId =
      await onCreate(values);

    if (createdId) {
      onClose();
    }
  }

  return (
    <DialogShell
      title={
        plan
          ? "Editar planificación"
          : "Crear planificación"
      }
      description={
        plan
          ? "Actualiza los objetivos, contenidos y actividades del plan."
          : "Organiza una unidad, semana o clase para tus estudiantes."
      }
      icon={FileText}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <section className="grid gap-5 md:grid-cols-2">
          <FormField label="Asignatura">
            <select
              value={courseId}
              onChange={(event) => {
                changeCourse(
                  event.target.value,
                );
              }}
              className={inputClassName}
            >
              <option value="">
                Seleccionar asignatura
              </option>

              {courses
                .filter(
                  (course) =>
                    course.status !==
                    "archived",
                )
                .map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.code} —{" "}
                    {course.name}
                  </option>
                ))}
            </select>
          </FormField>

          <FormField label="Sección">
            <select
              value={sectionId}
              onChange={(event) => {
                setSectionId(
                  event.target.value,
                );
              }}
              className={inputClassName}
            >
              <option value="">
                Todas las secciones
              </option>

              {availableSections.map(
                (section) => (
                  <option
                    key={section.id}
                    value={section.id}
                  >
                    Sección {section.code}
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField
            label="Título del plan"
            className="md:col-span-2"
          >
            <input
              value={title}
              onChange={(event) => {
                setTitle(
                  event.target.value,
                );
              }}
              placeholder="Introducción a la arquitectura modular"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Unidad o tema">
            <input
              value={unit}
              onChange={(event) => {
                setUnit(
                  event.target.value,
                );
              }}
              placeholder="Unidad 2"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Semana o período">
            <input
              value={weekLabel}
              onChange={(event) => {
                setWeekLabel(
                  event.target.value,
                );
              }}
              placeholder="Semana 4"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Fecha inicial">
            <div className="relative">
              <CalendarRange
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(
                    event.target.value,
                  );
                }}
                className={cn(
                  inputClassName,
                  "pl-11",
                )}
              />
            </div>
          </FormField>

          <FormField label="Fecha final">
            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(
                  event.target.value,
                );
              }}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Duración estimada">
            <div className="relative">
              <Clock3
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="number"
                min={1}
                max={1440}
                value={estimatedMinutes}
                onChange={(event) => {
                  setEstimatedMinutes(
                    Number(
                      event.target.value,
                    ),
                  );
                }}
                className={cn(
                  inputClassName,
                  "pl-11",
                )}
              />
            </div>
          </FormField>

          <FormField label="Estado">
            <select
              value={status}
              onChange={(event) => {
                const nextStatus =
                  event.target
                    .value as LessonPlanStatus;

                setStatus(nextStatus);

                if (
                  nextStatus ===
                  "archived"
                ) {
                  setVisibleToStudents(
                    false,
                  );
                }
              }}
              className={inputClassName}
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </FormField>
        </section>

        <section className="mt-7 rounded-[1.7rem] border border-primary/15 bg-secondary p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Layers3
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary-foreground/60">
                Diseño didáctico
              </p>

              <h3 className="mt-1 text-sm font-semibold text-secondary-foreground">
                Elementos de la planificación
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <MultiLineField
              label="Objetivos de aprendizaje"
              description="Escribe un objetivo por línea."
              value={objectives}
              onChange={setObjectives}
              placeholder={`Comprender la arquitectura modular.\nIdentificar responsabilidades de cada capa.`}
            />

            <MultiLineField
              label="Contenidos"
              description="Escribe un contenido por línea."
              value={contents}
              onChange={setContents}
              placeholder={`Arquitectura cliente-servidor.\nComponentes y servicios.\nSeparación de responsabilidades.`}
            />

            <MultiLineField
              label="Estrategias didácticas"
              description="Escribe una estrategia por línea."
              value={strategies}
              onChange={setStrategies}
              placeholder={`Explicación guiada.\nDemostración práctica.\nTrabajo colaborativo.`}
            />

            <MultiLineField
              label="Recursos"
              description="Escribe un recurso por línea."
              value={resources}
              onChange={setResources}
              placeholder={`Presentación digital.\nRepositorio de ejemplo.\nGuía PDF.`}
            />

            <MultiLineField
              label="Actividades"
              description="Escribe una actividad por línea."
              value={activities}
              onChange={setActivities}
              placeholder={`Analizar un diagrama de arquitectura.\nConstruir una estructura modular.\nDebatir ventajas y limitaciones.`}
            />
          </div>
        </section>

        <section className="mt-7 grid gap-5">
          <FormField label="Evidencia o evaluación">
            <textarea
              value={
                evaluationEvidence
              }
              onChange={(event) => {
                setEvaluationEvidence(
                  event.target.value,
                );
              }}
              placeholder="Producto, actividad o evidencia mediante la cual se verificará el aprendizaje."
              className={textareaClassName}
            />
          </FormField>

          <FormField label="Observaciones docentes">
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(
                  event.target.value,
                );
              }}
              placeholder="Notas, ajustes o consideraciones especiales."
              className={textareaClassName}
            />
          </FormField>
        </section>

        <section className="mt-7 rounded-[1.5rem] border border-border bg-background/60 p-5">
          <button
            type="button"
            disabled={
              status === "archived"
            }
            onClick={() => {
              setVisibleToStudents(
                (current) => !current,
              );
            }}
            className={cn(
              "flex w-full items-center gap-4 text-left disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                visibleToStudents
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {visibleToStudents ? (
                <Eye
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              ) : (
                <EyeOff
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Visible para estudiantes
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Esta opción prepara la planificación para su futura integración con el salón virtual.
              </p>
            </div>

            <div
              className={cn(
                "h-6 w-11 rounded-full p-1 transition-all",
                visibleToStudents
                  ? "bg-primary"
                  : "bg-muted",
              )}
            >
              <div
                className={cn(
                  "h-4 w-4 rounded-full bg-white transition-transform",
                  visibleToStudents &&
                    "translate-x-5",
                )}
              />
            </div>
          </button>
        </section>

        {formError && (
          <p className="mt-5 rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
            {formError}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="min-h-11 rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-muted-foreground"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <Save
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}

            {plan
              ? "Guardar cambios"
              : "Crear planificación"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

interface MultiLineFieldProps {
  label: string;
  description: string;
  value: string;
  placeholder: string;
  onChange: (
    value: string,
  ) => void;
}

function MultiLineField({
  label,
  description,
  value,
  placeholder,
  onChange,
}: MultiLineFieldProps) {
  return (
    <FormField label={label}>
      <p className="-mt-1 mb-2 text-xs text-secondary-foreground/60">
        {description}
      </p>

      <textarea
        value={value}
        onChange={(event) => {
          onChange(
            event.target.value,
          );
        }}
        placeholder={placeholder}
        className={cn(
          textareaClassName,
          "bg-background/75",
        )}
      />
    </FormField>
  );
}

interface DialogShellProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClose: () => void;
  children: ReactNode;
}

function DialogShell({
  title,
  description,
  icon: Icon,
  onClose,
  children,
}: DialogShellProps) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center py-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
        >
          <header className="flex items-start gap-4 border-b border-border p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold">
                {title}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground"
              aria-label="Cerrar"
            >
              <X
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>
          </header>

          <div className="max-h-[82vh] overflow-y-auto p-5 sm:p-6">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  className?: string;
  children: ReactNode;
}

function FormField({
  label,
  className,
  children,
}: FormFieldProps) {
  return (
    <label
      className={cn(
        "block",
        className,
      )}
    >
      <span className="mb-2 block text-xs font-semibold text-foreground">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm leading-6 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";