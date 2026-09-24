"use client";

import {
  BookOpen,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Mail,
  RefreshCcw,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";

import {
  EditEnrollmentDialog,
  EnrollStudentDialog,
} from "@/components/teacher/teacher-student-dialogs";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherStudents } from "@/hooks/use-teacher-students";
import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicSection,
} from "@/types/academic-course";
import type {
  EnrollmentStatus,
  TeacherEnrollment,
} from "@/types/student-enrollment";

type StatusFilter =
  | "all"
  | EnrollmentStatus;

const statusLabels: Record<
  EnrollmentStatus,
  string
> = {
  active: "Activa",
  inactive: "Inactiva",
  completed: "Completada",
};

export function TeacherStudentManager() {
  const {
    courses,
    sections,
    loading: coursesLoading,
  } = useTeacherCourses();

  const {
    enrollments,
    loading: studentsLoading,
    saving,
    searching,
    error,
    refreshEnrollments,
    searchStudents,
    createEnrollment,
    updateEnrollment,
  } = useTeacherStudents();

  const [search, setSearch] =
    useState("");

  const [courseFilter, setCourseFilter] =
    useState("all");

  const [sectionFilter, setSectionFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [
    selectedEnrollmentId,
    setSelectedEnrollmentId,
  ] = useState<string | null>(null);

  const [
    enrollmentDialogOpen,
    setEnrollmentDialogOpen,
  ] = useState(false);

  const [
    editingEnrollment,
    setEditingEnrollment,
  ] = useState<TeacherEnrollment | null>(
    null,
  );

  const loading =
    coursesLoading ||
    studentsLoading;

  const selectedEnrollment =
    enrollments.find(
      (enrollment) =>
        enrollment.id ===
        selectedEnrollmentId,
    ) ??
    enrollments[0] ??
    null;

  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredEnrollments =
    enrollments.filter(
      (enrollment) => {
        const matchesSearch =
          !normalizedSearch ||
          enrollment.studentName
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          enrollment.studentEmail
            .toLowerCase()
            .includes(
              normalizedSearch,
            );

        const matchesCourse =
          courseFilter === "all" ||
          enrollment.courseId ===
            courseFilter;

        const matchesSection =
          sectionFilter === "all" ||
          enrollment.sectionId ===
            sectionFilter;

        const matchesStatus =
          statusFilter === "all" ||
          enrollment.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesCourse &&
          matchesSection &&
          matchesStatus
        );
      },
    );

  const availableSections =
    sections.filter(
      (section) =>
        courseFilter === "all" ||
        section.courseId ===
          courseFilter,
    );

  const uniqueActiveStudents =
    new Set(
      enrollments
        .filter(
          (enrollment) =>
            enrollment.status ===
            "active",
        )
        .map(
          (enrollment) =>
            enrollment.studentId,
        ),
    ).size;

  const activeEnrollments =
    enrollments.filter(
      (enrollment) =>
        enrollment.status ===
        "active",
    ).length;

  const inactiveEnrollments =
    enrollments.filter(
      (enrollment) =>
        enrollment.status ===
        "inactive",
    ).length;

  const activeCourses =
    courses.filter(
      (course) =>
        course.status === "active",
    );

  function findCourse(
    courseId: string,
  ): AcademicCourse | undefined {
    return courses.find(
      (course) =>
        course.id === courseId,
    );
  }

  function findSection(
    sectionId: string,
  ): AcademicSection | undefined {
    return sections.find(
      (section) =>
        section.id === sectionId,
    );
  }

  function changeCourseFilter(
    value: string,
  ) {
    setCourseFilter(value);
    setSectionFilter("all");
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
            Cargando estudiantes
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sincronizando las inscripciones.
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
              <Users
                aria-hidden="true"
                className="h-4 w-4"
              />

              Gestión estudiantil
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Estudiantes e inscripciones
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Vincula estudiantes a tus
              asignaturas, administra sus
              secciones y controla el estado
              de cada inscripción.
            </p>

            <button
              type="button"
              disabled={
                activeCourses.length === 0
              }
              onClick={() => {
                setEnrollmentDialogOpen(
                  true,
                );
              }}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#59e4d2] px-5 text-sm font-bold text-[#05231f] shadow-xl shadow-[#59e4d2]/15 disabled:pointer-events-none disabled:opacity-45"
            >
              <UserPlus
                aria-hidden="true"
                className="h-4 w-4"
              />

              Vincular estudiante
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <HeroMetric
              value={uniqueActiveStudents}
              label="Estudiantes"
            />

            <HeroMetric
              value={activeEnrollments}
              label="Inscripciones"
            />

            <HeroMetric
              value={inactiveEnrollments}
              label="Inactivas"
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
          Debes crear una asignatura activa y
          una sección antes de vincular
          estudiantes.
        </section>
      )}

      <section className="rounded-[1.7rem] border border-border bg-card/70 p-4 shadow-sm backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_repeat(3,minmax(10rem,0.35fr))_auto]">
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
              placeholder="Buscar estudiante o correo"
              className="h-12 w-full rounded-2xl border border-border bg-background/70 pl-11 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(event) => {
              changeCourseFilter(
                event.target.value,
              );
            }}
            className={filterClassName}
          >
            <option value="all">
              Todas las materias
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
            value={sectionFilter}
            onChange={(event) => {
              setSectionFilter(
                event.target.value,
              );
            }}
            className={filterClassName}
          >
            <option value="all">
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

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target
                  .value as StatusFilter,
              );
            }}
            className={filterClassName}
          >
            <option value="all">
              Todos los estados
            </option>

            <option value="active">
              Activas
            </option>

            <option value="inactive">
              Inactivas
            </option>

            <option value="completed">
              Completadas
            </option>
          </select>

          <button
            type="button"
            onClick={() => {
              void refreshEnrollments();
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 px-4 text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-foreground"
          >
            <RefreshCcw
              aria-hidden="true"
              className="h-4 w-4"
            />

            Actualizar
          </button>
        </div>
      </section>

      {enrollments.length === 0 ? (
        <EmptyStudents
          disabled={
            activeCourses.length === 0
          }
          onCreate={() => {
            setEnrollmentDialogOpen(true);
          }}
        />
      ) : (
        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Registro académico
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Estudiantes vinculados
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {filteredEnrollments.length}{" "}
                  resultado(s)
                </p>
              </div>

              <Users
                aria-hidden="true"
                className="h-5 w-5 text-muted-foreground"
              />
            </div>

            <div className="divide-y divide-border">
              {filteredEnrollments.map(
                (enrollment) => {
                  const course =
                    findCourse(
                      enrollment.courseId,
                    );

                  const section =
                    findSection(
                      enrollment.sectionId,
                    );

                  const selected =
                    selectedEnrollment?.id ===
                    enrollment.id;

                  return (
                    <button
                      key={enrollment.id}
                      type="button"
                      onClick={() => {
                        setSelectedEnrollmentId(
                          enrollment.id,
                        );
                      }}
                      className={cn(
                        "flex w-full flex-col gap-4 p-5 text-left transition-all sm:flex-row sm:items-center",
                        selected
                          ? "bg-secondary"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <StudentAvatar
                        name={
                          enrollment.studentName
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-semibold">
                            {
                              enrollment.studentName
                            }
                          </h3>

                          <StatusBadge
                            status={
                              enrollment.status
                            }
                          />
                        </div>

                        <p className="mt-1 flex items-center gap-2 truncate text-xs text-muted-foreground">
                          <Mail
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                          />

                          {
                            enrollment.studentEmail
                          }
                        </p>
                      </div>

                      <div className="grid min-w-56 grid-cols-2 gap-3">
                        <SmallInformation
                          label="Asignatura"
                          value={
                            course?.code ??
                            "Sin materia"
                          }
                        />

                        <SmallInformation
                          label="Sección"
                          value={
                            section
                              ? `Sección ${section.code}`
                              : "Sin sección"
                          }
                        />
                      </div>
                    </button>
                  );
                })}
            </div>

            {filteredEnrollments.length ===
              0 && (
              <div className="p-10 text-center">
                <Search
                  aria-hidden="true"
                  className="mx-auto h-7 w-7 text-primary"
                />

                <h3 className="mt-4 text-base font-semibold">
                  No encontramos estudiantes
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Cambia los filtros o el texto
                  de búsqueda.
                </p>
              </div>
            )}
          </div>

          <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
            {selectedEnrollment && (
              <StudentDetail
                enrollment={
                  selectedEnrollment
                }
                course={findCourse(
                  selectedEnrollment.courseId,
                )}
                section={findSection(
                  selectedEnrollment.sectionId,
                )}
                saving={saving}
                onEdit={() => {
                  setEditingEnrollment(
                    selectedEnrollment,
                  );
                }}
                onToggle={() => {
                  void updateEnrollment({
                    enrollmentId:
                      selectedEnrollment.id,
                    status:
                      selectedEnrollment.status ===
                      "active"
                        ? "inactive"
                        : "active",
                  });
                }}
              />
            )}
          </aside>
        </section>
      )}

      {enrollmentDialogOpen && (
        <EnrollStudentDialog
          courses={activeCourses}
          sections={sections}
          enrollments={enrollments}
          saving={saving}
          searching={searching}
          onClose={() => {
            setEnrollmentDialogOpen(
              false,
            );
          }}
          onSearch={searchStudents}
          onCreate={createEnrollment}
        />
      )}

      {editingEnrollment &&
        findCourse(
          editingEnrollment.courseId,
        ) && (
          <EditEnrollmentDialog
            enrollment={
              editingEnrollment
            }
            course={
              findCourse(
                editingEnrollment.courseId,
              )!
            }
            sections={sections}
            saving={saving}
            onClose={() => {
              setEditingEnrollment(null);
            }}
            onUpdate={updateEnrollment}
          />
        )}
    </div>
  );
}

interface StudentDetailProps {
  enrollment: TeacherEnrollment;
  course?: AcademicCourse;
  section?: AcademicSection;
  saving: boolean;
  onEdit: () => void;
  onToggle: () => void;
}

function StudentDetail({
  enrollment,
  course,
  section,
  saving,
  onEdit,
  onToggle,
}: StudentDetailProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <div className="relative overflow-hidden bg-[#071a22] p-6 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(45,222,199,0.23),transparent_35%),radial-gradient(circle_at_85%_85%,rgba(117,104,255,0.22),transparent_35%)]"
        />

        <div className="relative z-10">
          <StudentAvatar
            name={enrollment.studentName}
            large
          />

          <h2 className="mt-5 text-xl font-semibold">
            {enrollment.studentName}
          </h2>

          <p className="mt-2 text-sm text-white/55">
            {enrollment.studentEmail}
          </p>

          <div className="mt-4">
            <StatusBadge
              status={enrollment.status}
              dark
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="space-y-3">
          <DetailItem
            icon={BookOpen}
            label="Asignatura"
            value={
              course
                ? `${course.code} — ${course.name}`
                : "No disponible"
            }
          />

          <DetailItem
            icon={Layers3}
            label="Sección"
            value={
              section
                ? `Sección ${section.code}`
                : "No disponible"
            }
          />

          <DetailItem
            icon={GraduationCap}
            label="Período"
            value={
              course?.period ??
              "No disponible"
            }
          />
        </div>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={onEdit}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15"
          >
            <Edit3
              aria-hidden="true"
              className="h-4 w-4"
            />

            Editar inscripción
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={onToggle}
            className={cn(
              "flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold",
              enrollment.status ===
                "active"
                ? "border-danger/20 bg-danger/5 text-danger"
                : "border-primary/20 bg-secondary text-secondary-foreground",
            )}
          >
            {enrollment.status ===
            "active" ? (
              <>
                <UserMinus
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Desactivar inscripción
              </>
            ) : (
              <>
                <UserCheck
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Reactivar inscripción
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function EmptyStudents({
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
          <Users
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          Aún no tienes estudiantes vinculados
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Busca una cuenta estudiantil y
          asígnala a una materia y sección.
        </p>

        <button
          type="button"
          disabled={disabled}
          onClick={onCreate}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-45"
        >
          <UserPlus
            aria-hidden="true"
            className="h-4 w-4"
          />

          Vincular estudiante
        </button>
      </div>
    </section>
  );
}

function StudentAvatar({
  name,
  large = false,
}: {
  name: string;
  large?: boolean;
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
        "flex shrink-0 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground",
        large
          ? "h-16 w-16 text-lg"
          : "h-11 w-11 text-xs",
      )}
    >
      {initials || "E"}
    </div>
  );
}

function StatusBadge({
  status,
  dark = false,
}: {
  status: EnrollmentStatus;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold",
        status === "active" &&
          (dark
            ? "border-[#59e4d2]/25 bg-[#59e4d2]/15 text-[#8ff2e4]"
            : "border-primary/20 bg-secondary text-secondary-foreground"),
        status === "inactive" &&
          (dark
            ? "border-white/10 bg-white/[0.06] text-white/55"
            : "border-border bg-muted text-muted-foreground"),
        status === "completed" &&
          "border-[#b59aff]/25 bg-[#8e78ec]/15 text-[#8e78ec]",
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function SmallInformation({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/60 p-3">
      <p className="truncate text-xs font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon
          aria-hidden="true"
          className="h-4 w-4"
        />
      </div>

      <div className="min-w-0">
        <p className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
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

const filterClassName =
  "h-12 rounded-2xl border border-border bg-background/70 px-4 text-xs font-semibold text-muted-foreground outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10";