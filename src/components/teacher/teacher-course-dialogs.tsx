"use client";

import {
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Layers3,
  LoaderCircle,
  MapPin,
  Save,
  Users,
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
  AcademicCourseStatus,
  AcademicCourseTone,
  AcademicModality,
  AcademicSection,
  AcademicSectionStatus,
  CourseFormValues,
  CreateTeacherCourseInput,
  ScheduleDay,
  SectionFormValues,
} from "@/types/academic-course";

const dayOptions: ScheduleDay[] = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

const toneOptions: Array<{
  value: AcademicCourseTone;
  label: string;
  surface: string;
}> = [
  {
    value: "teal",
    label: "Turquesa",
    surface: "bg-[#24cdb8]",
  },
  {
    value: "violet",
    label: "Violeta",
    surface: "bg-[#8e78ec]",
  },
  {
    value: "amber",
    label: "Ámbar",
    surface: "bg-[#e8a83c]",
  },
  {
    value: "blue",
    label: "Azul",
    surface: "bg-[#3f9bd1]",
  },
];

interface CourseDialogProps {
  mode: "create" | "edit";
  course?: AcademicCourse;
  saving: boolean;
  onClose: () => void;
  onCreate: (
    input: CreateTeacherCourseInput,
  ) => Promise<string | null>;
  onUpdate: (
    courseId: string,
    values: CourseFormValues,
  ) => Promise<boolean>;
}

export function CourseDialog({
  mode,
  course,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: CourseDialogProps) {
  const [name, setName] = useState(
    course?.name ?? "",
  );

  const [code, setCode] = useState(
    course?.code ?? "",
  );

  const [
    description,
    setDescription,
  ] = useState(
    course?.description ?? "",
  );

  const [area, setArea] = useState(
    course?.area ?? "",
  );

  const [period, setPeriod] =
    useState(
      course?.period ?? "2026-III",
    );

  const [status, setStatus] =
    useState<AcademicCourseStatus>(
      course?.status ?? "active",
    );

  const [tone, setTone] =
    useState<AcademicCourseTone>(
      course?.tone ?? "teal",
    );

  const [
    sectionCode,
    setSectionCode,
  ] = useState("A");

  const [
    scheduleDays,
    setScheduleDays,
  ] = useState<ScheduleDay[]>([
    "Lun",
    "Mié",
  ]);

  const [startTime, setStartTime] =
    useState("08:00");

  const [endTime, setEndTime] =
    useState("10:00");

  const [classroom, setClassroom] =
    useState("Aula 1");

  const [modality, setModality] =
    useState<AcademicModality>(
      "on-site",
    );

  const [capacity, setCapacity] =
    useState(30);

  const [formError, setFormError] =
    useState<string | null>(null);

  function toggleDay(day: ScheduleDay) {
    setScheduleDays((current) =>
      current.includes(day)
        ? current.filter(
            (item) => item !== day,
          )
        : [...current, day],
    );
  }

  function validateCourse() {
    if (name.trim().length < 3) {
      return "Escribe el nombre completo de la asignatura.";
    }

    if (code.trim().length < 2) {
      return "Escribe un código para la asignatura.";
    }

    if (area.trim().length < 3) {
      return "Indica el área académica.";
    }

    if (period.trim().length < 4) {
      return "Indica el período académico.";
    }

    if (
      mode === "create" &&
      scheduleDays.length === 0
    ) {
      return "Selecciona al menos un día para la primera sección.";
    }

    if (
      mode === "create" &&
      (!startTime || !endTime)
    ) {
      return "Completa el horario de la primera sección.";
    }

    if (
      mode === "create" &&
      capacity < 1
    ) {
      return "La capacidad debe ser mayor que cero.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateCourse();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    const courseValues:
      CourseFormValues = {
        name,
        code,
        description,
        area,
        period,
        status,
        tone,
      };

    if (
      mode === "edit" &&
      course
    ) {
      const updated = await onUpdate(
        course.id,
        courseValues,
      );

      if (updated) {
        onClose();
      }

      return;
    }

    const createdId = await onCreate({
      course: courseValues,
      section: {
        code: sectionCode,
        scheduleDays,
        startTime,
        endTime,
        classroom,
        modality,
        capacity,
        status: "active",
      },
    });

    if (createdId) {
      onClose();
    }
  }

  return (
    <DialogShell
      title={
        mode === "create"
          ? "Crear asignatura"
          : "Editar asignatura"
      }
      description={
        mode === "create"
          ? "Registra la materia y configura su primera sección."
          : "Actualiza la información académica de la materia."
      }
      icon={BookOpen}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            label="Nombre de la asignatura"
            className="md:col-span-2"
          >
            <input
              value={name}
              onChange={(event) => {
                setName(
                  event.target.value,
                );
              }}
              placeholder="Programación Web Avanzada"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Código">
            <input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.toUpperCase(),
                );
              }}
              placeholder="PWA-402"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Período académico">
            <input
              value={period}
              onChange={(event) => {
                setPeriod(
                  event.target.value,
                );
              }}
              placeholder="2026-III"
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Área académica"
            className="md:col-span-2"
          >
            <input
              value={area}
              onChange={(event) => {
                setArea(
                  event.target.value,
                );
              }}
              placeholder="Ingeniería de software"
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
              placeholder="Describe el propósito y contenido general de la asignatura."
              className={cn(
                inputClassName,
                "min-h-28 resize-y py-3",
              )}
            />
          </FormField>

          <FormField label="Estado">
            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target
                    .value as AcademicCourseStatus,
                );
              }}
              className={inputClassName}
            >
              <option value="active">
                Activa
              </option>

              <option value="draft">
                Borrador
              </option>

              <option value="archived">
                Archivada
              </option>
            </select>
          </FormField>

          <FormField label="Color identificador">
            <div className="grid grid-cols-4 gap-2">
              {toneOptions.map(
                (option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTone(
                        option.value,
                      );
                    }}
                    className={cn(
                      "flex min-h-11 items-center justify-center rounded-xl border transition-all",
                      tone ===
                        option.value
                        ? "border-primary bg-secondary ring-2 ring-primary/20"
                        : "border-border bg-background",
                    )}
                    title={option.label}
                  >
                    <span
                      className={cn(
                        "h-5 w-5 rounded-full",
                        option.surface,
                      )}
                    />

                    {tone ===
                      option.value && (
                      <Check
                        aria-hidden="true"
                        className="ml-2 h-4 w-4 text-primary"
                      />
                    )}
                  </button>
                ),
              )}
            </div>
          </FormField>
        </div>

        {mode === "create" && (
          <section className="mt-7 rounded-[1.6rem] border border-primary/15 bg-secondary p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Layers3
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary-foreground/60">
                  Configuración inicial
                </p>

                <h3 className="mt-1 text-sm font-semibold text-secondary-foreground">
                  Primera sección
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <FormField label="Código de sección">
                <input
                  value={sectionCode}
                  onChange={(event) => {
                    setSectionCode(
                      event.target.value.toUpperCase(),
                    );
                  }}
                  placeholder="A"
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Capacidad">
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={capacity}
                  onChange={(event) => {
                    setCapacity(
                      Number(
                        event.target.value,
                      ),
                    );
                  }}
                  className={inputClassName}
                />
              </FormField>

              <FormField
                label="Días"
                className="md:col-span-2"
              >
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {dayOptions.map(
                    (day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          toggleDay(day);
                        }}
                        className={cn(
                          "min-h-10 rounded-xl border text-xs font-semibold transition-all",
                          scheduleDays.includes(
                            day,
                          )
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground",
                        )}
                      >
                        {day}
                      </button>
                    ),
                  )}
                </div>
              </FormField>

              <FormField label="Hora de inicio">
                <input
                  type="time"
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(
                      event.target.value,
                    );
                  }}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Hora de cierre">
                <input
                  type="time"
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(
                      event.target.value,
                    );
                  }}
                  className={inputClassName}
                />
              </FormField>

              <FormField label="Modalidad">
                <select
                  value={modality}
                  onChange={(event) => {
                    setModality(
                      event.target
                        .value as AcademicModality,
                    );
                  }}
                  className={inputClassName}
                >
                  <option value="on-site">
                    Presencial
                  </option>

                  <option value="online">
                    En línea
                  </option>

                  <option value="hybrid">
                    Híbrida
                  </option>
                </select>
              </FormField>

              <FormField label="Aula o enlace">
                <input
                  value={classroom}
                  onChange={(event) => {
                    setClassroom(
                      event.target.value,
                    );
                  }}
                  placeholder="Aula 1"
                  className={inputClassName}
                />
              </FormField>
            </div>
          </section>
        )}

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

            {mode === "create"
              ? "Crear asignatura"
              : "Guardar cambios"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

interface SectionDialogProps {
  course: AcademicCourse;
  section?: AcademicSection;
  saving: boolean;
  onClose: () => void;
  onCreate: (
    courseId: string,
    values: SectionFormValues,
  ) => Promise<string | null>;
  onUpdate: (
    sectionId: string,
    values: SectionFormValues,
  ) => Promise<boolean>;
}

export function SectionDialog({
  course,
  section,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: SectionDialogProps) {
  const [code, setCode] = useState(
    section?.code ?? "",
  );

  const [
    scheduleDays,
    setScheduleDays,
  ] = useState<ScheduleDay[]>(
    section?.scheduleDays ?? [
      "Lun",
      "Mié",
    ],
  );

  const [startTime, setStartTime] =
    useState(
      section?.startTime ?? "08:00",
    );

  const [endTime, setEndTime] =
    useState(
      section?.endTime ?? "10:00",
    );

  const [classroom, setClassroom] =
    useState(
      section?.classroom ?? "Aula 1",
    );

  const [modality, setModality] =
    useState<AcademicModality>(
      section?.modality ??
        "on-site",
    );

  const [capacity, setCapacity] =
    useState(
      section?.capacity ?? 30,
    );

  const [status, setStatus] =
    useState<AcademicSectionStatus>(
      section?.status ?? "active",
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  function toggleDay(day: ScheduleDay) {
    setScheduleDays((current) =>
      current.includes(day)
        ? current.filter(
            (item) => item !== day,
          )
        : [...current, day],
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (code.trim().length < 1) {
      setFormError(
        "Escribe un código para la sección.",
      );

      return;
    }

    if (scheduleDays.length === 0) {
      setFormError(
        "Selecciona al menos un día.",
      );

      return;
    }

    if (!startTime || !endTime) {
      setFormError(
        "Completa el horario.",
      );

      return;
    }

    if (capacity < 1) {
      setFormError(
        "La capacidad debe ser mayor que cero.",
      );

      return;
    }

    setFormError(null);

    const values:
      SectionFormValues = {
        code,
        scheduleDays,
        startTime,
        endTime,
        classroom,
        modality,
        capacity,
        status,
      };

    if (section) {
      const updated = await onUpdate(
        section.id,
        values,
      );

      if (updated) {
        onClose();
      }

      return;
    }

    const sectionId = await onCreate(
      course.id,
      values,
    );

    if (sectionId) {
      onClose();
    }
  }

  return (
    <DialogShell
      title={
        section
          ? "Editar sección"
          : "Agregar sección"
      }
      description={`${course.code} · ${course.name}`}
      icon={CalendarDays}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Código de sección">
            <input
              value={code}
              onChange={(event) => {
                setCode(
                  event.target.value.toUpperCase(),
                );
              }}
              placeholder="A"
              className={inputClassName}
            />
          </FormField>

          <FormField label="Capacidad">
            <div className="relative">
              <Users
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="number"
                min={1}
                max={200}
                value={capacity}
                onChange={(event) => {
                  setCapacity(
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

          <FormField
            label="Días de clase"
            className="md:col-span-2"
          >
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dayOptions.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    toggleDay(day);
                  }}
                  className={cn(
                    "min-h-10 rounded-xl border text-xs font-semibold transition-all",
                    scheduleDays.includes(
                      day,
                    )
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Hora de inicio">
            <div className="relative">
              <Clock3
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="time"
                value={startTime}
                onChange={(event) => {
                  setStartTime(
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

          <FormField label="Hora de cierre">
            <input
              type="time"
              value={endTime}
              onChange={(event) => {
                setEndTime(
                  event.target.value,
                );
              }}
              className={inputClassName}
            />
          </FormField>

          <FormField label="Modalidad">
            <select
              value={modality}
              onChange={(event) => {
                setModality(
                  event.target
                    .value as AcademicModality,
                );
              }}
              className={inputClassName}
            >
              <option value="on-site">
                Presencial
              </option>

              <option value="online">
                En línea
              </option>

              <option value="hybrid">
                Híbrida
              </option>
            </select>
          </FormField>

          <FormField label="Aula o enlace">
            <div className="relative">
              <MapPin
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={classroom}
                onChange={(event) => {
                  setClassroom(
                    event.target.value,
                  );
                }}
                placeholder="Aula 1"
                className={cn(
                  inputClassName,
                  "pl-11",
                )}
              />
            </div>
          </FormField>

          <FormField
            label="Estado"
            className="md:col-span-2"
          >
            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target
                    .value as AcademicSectionStatus,
                );
              }}
              className={inputClassName}
            >
              <option value="active">
                Activa
              </option>

              <option value="inactive">
                Inactiva
              </option>
            </select>
          </FormField>
        </div>

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

            {section
              ? "Guardar cambios"
              : "Agregar sección"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

interface DialogShellProps {
  title: string;
  description: string;
  icon: typeof BookOpen;
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
          className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl"
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

          <div className="max-h-[78vh] overflow-y-auto p-5 sm:p-6">
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