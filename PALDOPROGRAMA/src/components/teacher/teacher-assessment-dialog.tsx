"use client";

import {
  BarChart3,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Layers3,
  LoaderCircle,
  Plus,
  Save,
  Scale,
  Trash2,
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
  AssessmentRubricCriterion,
  TeacherAssessment,
  TeacherAssessmentDeliveryMode,
  TeacherAssessmentFormValues,
  TeacherAssessmentStatus,
  TeacherAssessmentType,
} from "@/types/teacher-assessment";

interface TeacherAssessmentDialogProps {
  assessment?: TeacherAssessment;
  courses: AcademicCourse[];
  sections: AcademicSection[];
  saving: boolean;
  getScopeWeight: (
    courseId: string,
    sectionId: string | null,
    excludedAssessmentId?: string,
  ) => number;
  onClose: () => void;
  onCreate: (
    values: TeacherAssessmentFormValues,
  ) => Promise<string | null>;
  onUpdate: (
    assessmentId: string,
    values: TeacherAssessmentFormValues,
  ) => Promise<boolean>;
}

const typeOptions: Array<{
  value: TeacherAssessmentType;
  label: string;
}> = [
  {
    value: "exam",
    label: "Examen",
  },
  {
    value: "quiz",
    label: "Cuestionario",
  },
  {
    value: "workshop",
    label: "Taller",
  },
  {
    value: "project",
    label: "Proyecto",
  },
  {
    value: "presentation",
    label: "Exposición",
  },
  {
    value: "practice",
    label: "Práctica",
  },
  {
    value: "assignment",
    label: "Tarea",
  },
];

const statusOptions: Array<{
  value: TeacherAssessmentStatus;
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
    value: "open",
    label: "Abierta",
  },
  {
    value: "closed",
    label: "Cerrada",
  },
  {
    value: "graded",
    label: "Calificada",
  },
  {
    value: "archived",
    label: "Archivada",
  },
];

function createInitialCriterion(
  points = 20,
): AssessmentRubricCriterion {
  return {
    id: "criterion-1",
    title: "Desempeño académico",
    description:
      "Valora el cumplimiento de los objetivos establecidos.",
    points,
  };
}

function createCriterionId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `criterion-${Date.now()}`;
}

export function TeacherAssessmentDialog({
  assessment,
  courses,
  sections,
  saving,
  getScopeWeight,
  onClose,
  onCreate,
  onUpdate,
}: TeacherAssessmentDialogProps) {
  const firstCourse =
    courses.find(
      (course) =>
        course.status === "active",
    ) ?? courses[0];

  const initialCourseId =
    assessment?.courseId ??
    firstCourse?.id ??
    "";

  const [courseId, setCourseId] =
    useState(initialCourseId);

  const [sectionId, setSectionId] =
    useState(
      assessment?.sectionId ?? "",
    );

  const [title, setTitle] =
    useState(
      assessment?.title ?? "",
    );

  const [description, setDescription] =
    useState(
      assessment?.description ?? "",
    );

  const [instructions, setInstructions] =
    useState(
      assessment?.instructions ?? "",
    );

  const [type, setType] =
    useState<TeacherAssessmentType>(
      assessment?.type ?? "exam",
    );

  const [deliveryMode, setDeliveryMode] =
    useState<TeacherAssessmentDeliveryMode>(
      assessment?.deliveryMode ??
        "online",
    );

  const [
    weightPercentage,
    setWeightPercentage,
  ] = useState(
    assessment?.weightPercentage ?? 20,
  );

  const [maxScore, setMaxScore] =
    useState(
      assessment?.maxScore ?? 20,
    );

  const [passingScore, setPassingScore] =
    useState(
      assessment?.passingScore ?? 10,
    );

  const [opensAt, setOpensAt] =
    useState(
      assessment?.opensAt ?? "",
    );

  const [closesAt, setClosesAt] =
    useState(
      assessment?.closesAt ?? "",
    );

  const [
    durationMinutes,
    setDurationMinutes,
  ] = useState(
    assessment?.durationMinutes ?? 60,
  );

  const [
    attemptsAllowed,
    setAttemptsAllowed,
  ] = useState(
    assessment?.attemptsAllowed ?? 1,
  );

  const [status, setStatus] =
    useState<TeacherAssessmentStatus>(
      assessment?.status ?? "draft",
    );

  const [
    visibleToStudents,
    setVisibleToStudents,
  ] = useState(
    assessment?.visibleToStudents ??
      false,
  );

  const [
    rubric,
    setRubric,
  ] = useState<
    AssessmentRubricCriterion[]
  >(
    assessment?.rubric.length
      ? assessment.rubric
      : [
          createInitialCriterion(
            assessment?.maxScore ?? 20,
          ),
        ],
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

  const normalizedSectionId =
    sectionId || null;

  const occupiedWeight =
    courseId
      ? getScopeWeight(
          courseId,
          normalizedSectionId,
          assessment?.id,
        )
      : 0;

  const projectedWeight =
    occupiedWeight +
    weightPercentage;

  const rubricTotal =
    rubric.reduce(
      (total, criterion) =>
        total + criterion.points,
      0,
    );

  function changeCourse(
    nextCourseId: string,
  ) {
    setCourseId(nextCourseId);
    setSectionId("");
  }

  function updateCriterion(
    criterionId: string,
    changes: Partial<AssessmentRubricCriterion>,
  ) {
    setRubric((current) =>
      current.map((criterion) =>
        criterion.id === criterionId
          ? {
              ...criterion,
              ...changes,
            }
          : criterion,
      ),
    );
  }

  function addCriterion() {
    setRubric((current) => [
      ...current,
      {
        id: createCriterionId(),
        title: "",
        description: "",
        points: 0,
      },
    ]);
  }

  function removeCriterion(
    criterionId: string,
  ) {
    setRubric((current) =>
      current.filter(
        (criterion) =>
          criterion.id !== criterionId,
      ),
    );
  }

  function validateForm() {
    if (!courseId) {
      return "Selecciona una asignatura.";
    }

    if (title.trim().length < 4) {
      return "Escribe el título de la evaluación.";
    }

    if (
      weightPercentage <= 0 ||
      weightPercentage > 100
    ) {
      return "La ponderación debe ser mayor que 0% y no superar 100%.";
    }

    if (projectedWeight > 100) {
      return `La ponderación total alcanzaría ${projectedWeight}%. El máximo permitido es 100%.`;
    }

    if (maxScore <= 0) {
      return "La nota máxima debe ser mayor que cero.";
    }

    if (
      passingScore < 0 ||
      passingScore > maxScore
    ) {
      return "La nota aprobatoria debe estar entre 0 y la nota máxima.";
    }

    if (!opensAt || !closesAt) {
      return "Selecciona la fecha de apertura y la fecha de cierre.";
    }

    if (closesAt <= opensAt) {
      return "La fecha de cierre debe ser posterior a la apertura.";
    }

    if (durationMinutes < 1) {
      return "La duración debe ser mayor que cero.";
    }

    if (
      attemptsAllowed < 1 ||
      attemptsAllowed > 10
    ) {
      return "Los intentos deben estar entre 1 y 10.";
    }

    if (rubric.length === 0) {
      return "Agrega al menos un criterio de evaluación.";
    }

    if (
      rubric.some(
        (criterion) =>
          criterion.title.trim().length <
            2 ||
          criterion.points < 0,
      )
    ) {
      return "Completa el nombre y los puntos de cada criterio.";
    }

    if (rubricTotal !== maxScore) {
      return `La rúbrica suma ${rubricTotal} puntos, pero la nota máxima es ${maxScore}.`;
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
      TeacherAssessmentFormValues = {
        courseId,
        sectionId:
          sectionId || null,
        title,
        description,
        instructions,
        type,
        deliveryMode,
        weightPercentage,
        maxScore,
        passingScore,
        opensAt,
        closesAt,
        durationMinutes,
        attemptsAllowed,
        rubric,
        status,
        visibleToStudents:
          status === "archived"
            ? false
            : visibleToStudents,
      };

    if (assessment) {
      const updated = await onUpdate(
        assessment.id,
        values,
      );

      if (updated) {
        onClose();
      }

      return;
    }

    const assessmentId =
      await onCreate(values);

    if (assessmentId) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center py-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={
            assessment
              ? "Editar evaluación"
              : "Crear evaluación"
          }
          className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
        >
          <header className="flex items-start gap-4 border-b border-border p-5 sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ClipboardCheck
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold">
                {assessment
                  ? "Editar evaluación"
                  : "Crear evaluación"}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Configura ponderación,
                calificación, fechas, intentos
                y criterios de evaluación.
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
                          Sección{" "}
                          {section.code}
                        </option>
                      ),
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Título de la evaluación"
                  className="md:col-span-2"
                >
                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(
                        event.target.value,
                      );
                    }}
                    placeholder="Evaluación de arquitectura modular"
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="Descripción"
                  className="md:col-span-2"
                >
                  <textarea
                    value={description}
                    onChange={(event) => {
                      setDescription(
                        event.target.value,
                      );
                    }}
                    placeholder="Describe el propósito y los temas incluidos."
                    className={textareaClassName}
                  />
                </FormField>

                <FormField label="Tipo">
                  <select
                    value={type}
                    onChange={(event) => {
                      setType(
                        event.target
                          .value as TeacherAssessmentType,
                      );
                    }}
                    className={inputClassName}
                  >
                    {typeOptions.map(
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

                <FormField label="Modalidad">
                  <select
                    value={deliveryMode}
                    onChange={(event) => {
                      setDeliveryMode(
                        event.target
                          .value as TeacherAssessmentDeliveryMode,
                      );
                    }}
                    className={inputClassName}
                  >
                    <option value="online">
                      En línea
                    </option>

                    <option value="manual">
                      Presencial o entrega manual
                    </option>
                  </select>
                </FormField>
              </section>

              <section className="mt-7 rounded-[1.7rem] border border-primary/15 bg-secondary p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <BarChart3
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary-foreground/60">
                      Configuración académica
                    </p>

                    <h3 className="mt-1 text-sm font-semibold text-secondary-foreground">
                      Ponderación y calificación
                    </h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Ponderación">
                    <div className="relative">
                      <Scale
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      />

                      <input
                        type="number"
                        min={1}
                        max={100}
                        step="0.01"
                        value={
                          weightPercentage
                        }
                        onChange={(event) => {
                          setWeightPercentage(
                            Number(
                              event.target.value,
                            ),
                          );
                        }}
                        className={cn(
                          inputClassName,
                          "pl-11 pr-10",
                        )}
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Nota máxima">
                    <input
                      type="number"
                      min={1}
                      step="0.01"
                      value={maxScore}
                      onChange={(event) => {
                        setMaxScore(
                          Number(
                            event.target.value,
                          ),
                        );
                      }}
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField label="Nota aprobatoria">
                    <input
                      type="number"
                      min={0}
                      max={maxScore}
                      step="0.01"
                      value={passingScore}
                      onChange={(event) => {
                        setPassingScore(
                          Number(
                            event.target.value,
                          ),
                        );
                      }}
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField label="Intentos">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={attemptsAllowed}
                      onChange={(event) => {
                        setAttemptsAllowed(
                          Number(
                            event.target.value,
                          ),
                        );
                      }}
                      className={inputClassName}
                    />
                  </FormField>
                </div>

                <div
                  className={cn(
                    "mt-5 rounded-2xl border p-4",
                    projectedWeight > 100
                      ? "border-danger/20 bg-danger/5"
                      : "border-primary/15 bg-background/60",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-secondary-foreground">
                        Distribución del alcance seleccionado
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Ya utilizado:{" "}
                        {occupiedWeight}% · Nueva
                        evaluación:{" "}
                        {weightPercentage}%
                      </p>
                    </div>

                    <span
                      className={cn(
                        "text-lg font-semibold",
                        projectedWeight > 100
                          ? "text-danger"
                          : "text-primary",
                      )}
                    >
                      {projectedWeight}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        projectedWeight > 100
                          ? "bg-danger"
                          : "bg-primary",
                      )}
                      style={{
                        width: `${Math.min(
                          projectedWeight,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-7 grid gap-5 md:grid-cols-2">
                <FormField label="Fecha de apertura">
                  <div className="relative">
                    <CalendarRange
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="datetime-local"
                      value={opensAt}
                      onChange={(event) => {
                        setOpensAt(
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

                <FormField label="Fecha de cierre">
                  <input
                    type="datetime-local"
                    value={closesAt}
                    onChange={(event) => {
                      setClosesAt(
                        event.target.value,
                      );
                    }}
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Duración en minutos">
                  <div className="relative">
                    <Clock3
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />

                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={durationMinutes}
                      onChange={(event) => {
                        setDurationMinutes(
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
                          .value as TeacherAssessmentStatus;

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

                <FormField
                  label="Instrucciones"
                  className="md:col-span-2"
                >
                  <textarea
                    value={instructions}
                    onChange={(event) => {
                      setInstructions(
                        event.target.value,
                      );
                    }}
                    placeholder="Indica reglas, formato de entrega y recomendaciones."
                    className={textareaClassName}
                  />
                </FormField>
              </section>

              <section className="mt-7 rounded-[1.7rem] border border-border bg-background/60 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                      <Layers3
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                        Instrumento de evaluación
                      </p>

                      <h3 className="mt-1 text-sm font-semibold">
                        Rúbrica por criterios
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addCriterion}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 text-xs font-semibold text-secondary-foreground"
                  >
                    <Plus
                      aria-hidden="true"
                      className="h-4 w-4"
                    />

                    Agregar criterio
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {rubric.map(
                    (criterion, index) => (
                      <article
                        key={criterion.id}
                        className="rounded-[1.4rem] border border-border bg-card p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                            {index + 1}
                          </div>

                          <button
                            type="button"
                            disabled={
                              rubric.length === 1
                            }
                            onClick={() => {
                              removeCriterion(
                                criterion.id,
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger/20 bg-danger/5 text-danger disabled:pointer-events-none disabled:opacity-35"
                            aria-label="Eliminar criterio"
                          >
                            <Trash2
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          </button>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_8rem]">
                          <FormField label="Criterio">
                            <input
                              value={
                                criterion.title
                              }
                              onChange={(event) => {
                                updateCriterion(
                                  criterion.id,
                                  {
                                    title:
                                      event.target
                                        .value,
                                  },
                                );
                              }}
                              placeholder="Dominio del contenido"
                              className={inputClassName}
                            />
                          </FormField>

                          <FormField label="Puntos">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={
                                criterion.points
                              }
                              onChange={(event) => {
                                updateCriterion(
                                  criterion.id,
                                  {
                                    points:
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                  },
                                );
                              }}
                              className={inputClassName}
                            />
                          </FormField>

                          <FormField
                            label="Descripción"
                            className="md:col-span-2"
                          >
                            <textarea
                              value={
                                criterion.description
                              }
                              onChange={(event) => {
                                updateCriterion(
                                  criterion.id,
                                  {
                                    description:
                                      event.target
                                        .value,
                                  },
                                );
                              }}
                              placeholder="Describe lo que se espera del estudiante."
                              className={cn(
                                textareaClassName,
                                "min-h-20",
                              )}
                            />
                          </FormField>
                        </div>
                      </article>
                    ),
                  )}
                </div>

                <div
                  className={cn(
                    "mt-5 flex items-center justify-between rounded-2xl border p-4",
                    rubricTotal === maxScore
                      ? "border-primary/20 bg-secondary"
                      : "border-danger/20 bg-danger/5",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {rubricTotal ===
                    maxScore ? (
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-5 w-5 text-primary"
                      />
                    ) : (
                      <FileText
                        aria-hidden="true"
                        className="h-5 w-5 text-danger"
                      />
                    )}

                    <div>
                      <p className="text-xs font-semibold">
                        Total de la rúbrica
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Debe coincidir con la
                        nota máxima.
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-lg font-semibold",
                      rubricTotal === maxScore
                        ? "text-primary"
                        : "text-danger",
                    )}
                  >
                    {rubricTotal}/{maxScore}
                  </span>
                </div>
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
                  className="flex w-full items-center gap-4 text-left disabled:cursor-not-allowed disabled:opacity-50"
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
                      La evaluación quedará
                      preparada para mostrarse
                      en el salón virtual.
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

                  {assessment
                    ? "Guardar cambios"
                    : "Crear evaluación"}
                </button>
              </div>
            </form>
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
      <span className="mb-2 block text-xs font-semibold">
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