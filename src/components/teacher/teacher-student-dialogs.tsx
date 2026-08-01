"use client";

import {
  BookOpen,
  Check,
  LoaderCircle,
  Mail,
  Save,
  Search,
  UserPlus,
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
  AcademicSection,
} from "@/types/academic-course";
import type {
  EnrollmentStatus,
  StudentDirectoryItem,
  TeacherEnrollment,
} from "@/types/student-enrollment";

interface EnrollStudentDialogProps {
  courses: AcademicCourse[];
  sections: AcademicSection[];
  enrollments: TeacherEnrollment[];
  saving: boolean;
  searching: boolean;
  onClose: () => void;
  onSearch: (
    search: string,
  ) => Promise<StudentDirectoryItem[]>;
  onCreate: (input: {
    studentId: string;
    courseId: string;
    sectionId: string;
  }) => Promise<boolean>;
}

export function EnrollStudentDialog({
  courses,
  sections,
  enrollments,
  saving,
  searching,
  onClose,
  onSearch,
  onCreate,
}: EnrollStudentDialogProps) {
  const firstCourse =
    courses.find(
      (course) =>
        course.status === "active",
    ) ?? courses[0];

  const initialSections =
    sections.filter(
      (section) =>
        section.courseId ===
          firstCourse?.id &&
        section.status === "active",
    );

  const [courseId, setCourseId] =
    useState(firstCourse?.id ?? "");

  const [sectionId, setSectionId] =
    useState(
      initialSections[0]?.id ?? "",
    );

  const [search, setSearch] =
    useState("");

  const [results, setResults] =
    useState<StudentDirectoryItem[]>(
      [],
    );

  const [
    selectedStudent,
    setSelectedStudent,
  ] = useState<StudentDirectoryItem | null>(
    null,
  );

  const [formError, setFormError] =
    useState<string | null>(null);

  const availableSections =
    sections.filter(
      (section) =>
        section.courseId === courseId &&
        section.status === "active",
    );

  function changeCourse(
    nextCourseId: string,
  ) {
    setCourseId(nextCourseId);

    const firstSection =
      sections.find(
        (section) =>
          section.courseId ===
            nextCourseId &&
          section.status === "active",
      );

    setSectionId(
      firstSection?.id ?? "",
    );
  }

  async function handleSearch() {
    const nextResults =
      await onSearch(search);

    setResults(nextResults);
    setSelectedStudent(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedStudent) {
      setFormError(
        "Selecciona un estudiante.",
      );

      return;
    }

    if (!courseId) {
      setFormError(
        "Selecciona una asignatura.",
      );

      return;
    }

    if (!sectionId) {
      setFormError(
        "Selecciona una sección activa.",
      );

      return;
    }

    setFormError(null);

    const created = await onCreate({
      studentId:
        selectedStudent.id,
      courseId,
      sectionId,
    });

    if (created) {
      onClose();
    }
  }

  return (
    <DialogShell
      title="Vincular estudiante"
      description="Busca una cuenta estudiantil y asígnala a una sección."
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
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
              {courses
                .filter(
                  (course) =>
                    course.status ===
                    "active",
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
              {availableSections.length >
              0 ? (
                availableSections.map(
                  (section) => (
                    <option
                      key={section.id}
                      value={section.id}
                    >
                      Sección{" "}
                      {section.code} ·{" "}
                      {section.startTime}
                    </option>
                  ),
                )
              ) : (
                <option value="">
                  Sin secciones activas
                </option>
              )}
            </select>
          </FormField>
        </div>

        <section className="mt-6 rounded-[1.6rem] border border-primary/15 bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary-foreground/60">
            Directorio estudiantil
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    void handleSearch();
                  }
                }}
                placeholder="Nombre o correo del estudiante"
                className={cn(
                  inputClassName,
                  "pl-11",
                )}
              />
            </div>

            <button
              type="button"
              disabled={searching}
              onClick={() => {
                void handleSearch();
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:pointer-events-none disabled:opacity-60"
            >
              {searching ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <Search
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              )}

              Buscar
            </button>
          </div>

          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {results.map((student) => {
              const selected =
                selectedStudent?.id ===
                student.id;

              const currentEnrollment =
                enrollments.find(
                  (enrollment) =>
                    enrollment.studentId ===
                      student.id &&
                    enrollment.courseId ===
                      courseId,
                );

              return (
                <button
                  key={student.id}
                  type="button"
                  disabled={
                    student.status !==
                      "active" ||
                    currentEnrollment
                      ?.status === "active"
                  }
                  onClick={() => {
                    setSelectedStudent(
                      student,
                    );
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-primary/15 bg-background/60",
                    "disabled:cursor-not-allowed disabled:opacity-55",
                  )}
                >
                  <StudentAvatar
                    name={student.name}
                    selected={selected}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {student.name}
                    </p>

                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selected
                          ? "text-primary-foreground/65"
                          : "text-muted-foreground",
                      )}
                    >
                      {student.email}
                    </p>
                  </div>

                  {currentEnrollment
                    ?.status === "active" ? (
                    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.62rem] font-semibold text-muted-foreground">
                      Ya inscrito
                    </span>
                  ) : selected ? (
                    <Check
                      aria-hidden="true"
                      className="h-5 w-5"
                    />
                  ) : null}
                </button>
              );
            })}

            {!searching &&
              results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-primary/20 p-5 text-center">
                  <Users
                    aria-hidden="true"
                    className="mx-auto h-6 w-6 text-primary"
                  />

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    Escribe al menos dos
                    caracteres para buscar una
                    cuenta estudiantil.
                  </p>
                </div>
              )}
          </div>
        </section>

        {selectedStudent && (
          <section className="mt-5 flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4">
            <StudentAvatar
              name={selectedStudent.name}
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {selectedStudent.name}
              </p>

              <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
                <Mail
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />

                {selectedStudent.email}
              </p>
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
            disabled={
              saving ||
              !selectedStudent ||
              !sectionId
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <UserPlus
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}

            Vincular estudiante
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

interface EditEnrollmentDialogProps {
  enrollment: TeacherEnrollment;
  course: AcademicCourse;
  sections: AcademicSection[];
  saving: boolean;
  onClose: () => void;
  onUpdate: (input: {
    enrollmentId: string;
    sectionId: string;
    status: EnrollmentStatus;
  }) => Promise<boolean>;
}

export function EditEnrollmentDialog({
  enrollment,
  course,
  sections,
  saving,
  onClose,
  onUpdate,
}: EditEnrollmentDialogProps) {
  const [sectionId, setSectionId] =
    useState(enrollment.sectionId);

  const [status, setStatus] =
    useState<EnrollmentStatus>(
      enrollment.status,
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const updated = await onUpdate({
      enrollmentId: enrollment.id,
      sectionId,
      status,
    });

    if (updated) {
      onClose();
    }
  }

  const courseSections =
    sections.filter(
      (section) =>
        section.courseId ===
        course.id,
    );

  return (
    <DialogShell
      title="Editar inscripción"
      description={`${enrollment.studentName} · ${course.code}`}
      onClose={onClose}
    >
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <section className="flex items-center gap-4 rounded-[1.5rem] border border-primary/15 bg-secondary p-4">
          <StudentAvatar
            name={enrollment.studentName}
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-secondary-foreground">
              {enrollment.studentName}
            </h3>

            <p className="mt-1 truncate text-xs text-secondary-foreground/65">
              {enrollment.studentEmail}
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <FormField label="Asignatura">
            <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4">
              <BookOpen
                aria-hidden="true"
                className="h-4 w-4 text-primary"
              />

              <span className="truncate text-sm">
                {course.code} —{" "}
                {course.name}
              </span>
            </div>
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
              {courseSections.map(
                (section) => (
                  <option
                    key={section.id}
                    value={section.id}
                  >
                    Sección {section.code} ·{" "}
                    {section.startTime}
                    {section.status ===
                    "inactive"
                      ? " · Inactiva"
                      : ""}
                  </option>
                ),
              )}
            </select>
          </FormField>

          <FormField
            label="Estado de inscripción"
            className="md:col-span-2"
          >
            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target
                    .value as EnrollmentStatus,
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

              <option value="completed">
                Completada
              </option>
            </select>
          </FormField>
        </div>

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

            Guardar cambios
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

interface DialogShellProps {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}

function DialogShell({
  title,
  description,
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
              <UserPlus
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

function StudentAvatar({
  name,
  selected = false,
}: {
  name: string;
  selected?: boolean;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part[0]?.toUpperCase(),
    )
    .join("");

  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-bold",
        selected
          ? "bg-white/15 text-primary-foreground"
          : "bg-primary text-primary-foreground",
      )}
    >
      {initials || "E"}
    </div>
  );
}

function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
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
  "h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10";