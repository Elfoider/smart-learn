"use client";
import type {
  LucideIcon,
} from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  Layers3,
  LoaderCircle,
  Mail,
  Save,
  Search,
  Send,
  Target,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";

import { useTeacherAssessments } from "@/hooks/use-teacher-assessments";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherGrades } from "@/hooks/use-teacher-grades";
import { useTeacherStudents } from "@/hooks/use-teacher-students";
import { createTeacherGradeId } from "@/lib/firebase/teacher-grade-service";
import { cn } from "@/lib/utils/cn";
import type {
  AcademicCourse,
  AcademicSection,
} from "@/types/academic-course";
import type {
  TeacherAssessment,
} from "@/types/teacher-assessment";
import type {
  TeacherGrade,
  TeacherGradeStatus,
} from "@/types/teacher-grade";
import type {
  TeacherEnrollment,
} from "@/types/student-enrollment";


interface GradeEdit {
  score: string;
  feedback: string;
  status: TeacherGradeStatus;
}

const gradeStatusLabels: Record<
  TeacherGradeStatus,
  string
> = {
  draft: "Borrador",
  published: "Publicada",
};

function roundNumber(
  value: number,
  decimals = 2,
) {
  const factor = 10 ** decimals;

  return (
    Math.round(
      (value + Number.EPSILON) *
        factor,
    ) / factor
  );
}

function formatScore(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-VE",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

export function TeacherGradebookManager() {
  const {
    courses,
    sections,
    loading: coursesLoading,
  } = useTeacherCourses();

  const {
    assessments,
    loading: assessmentsLoading,
    changeStatus:
      changeAssessmentStatus,
  } = useTeacherAssessments();

  const {
    enrollments,
    loading: enrollmentsLoading,
  } = useTeacherStudents();

  const {
    grades,
    loading: gradesLoading,
    saving,
    error,
    saveGrades,
    publishGrades,
  } = useTeacherGrades();

  const [courseId, setCourseId] =
    useState("");

  const [
    assessmentId,
    setAssessmentId,
  ] = useState("");

  const [sectionFilter, setSectionFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState("");

  const [edits, setEdits] =
    useState<
      Record<string, GradeEdit>
    >({});

  const loading =
    coursesLoading ||
    assessmentsLoading ||
    enrollmentsLoading ||
    gradesLoading;

  const defaultCourse =
    courses.find(
      (course) =>
        course.status === "active",
    ) ??
    courses[0] ??
    null;

  const resolvedCourseId =
    courseId ||
    defaultCourse?.id ||
    "";

  const courseAssessments =
    assessments.filter(
      (assessment) =>
        assessment.courseId ===
          resolvedCourseId &&
        assessment.status !==
          "archived",
    );

  const resolvedAssessmentId =
    assessmentId &&
    courseAssessments.some(
      (assessment) =>
        assessment.id ===
        assessmentId,
    )
      ? assessmentId
      : courseAssessments[0]?.id ??
        "";

  const selectedAssessment =
    courseAssessments.find(
      (assessment) =>
        assessment.id ===
        resolvedAssessmentId,
    ) ?? null;

  const selectedCourse =
    courses.find(
      (course) =>
        course.id ===
        resolvedCourseId,
    ) ?? null;

  const courseSections =
    sections.filter(
      (section) =>
        section.courseId ===
        resolvedCourseId,
    );

  const resolvedSectionFilter =
    selectedAssessment?.sectionId ??
    sectionFilter;

  const eligibleEnrollments =
    enrollments.filter(
      (enrollment) => {
        if (
          enrollment.courseId !==
            resolvedCourseId ||
          enrollment.status !== "active"
        ) {
          return false;
        }

        if (
          selectedAssessment?.sectionId
        ) {
          return (
            enrollment.sectionId ===
            selectedAssessment.sectionId
          );
        }

        if (
          resolvedSectionFilter !==
          "all"
        ) {
          return (
            enrollment.sectionId ===
            resolvedSectionFilter
          );
        }

        return true;
      },
    );

  const normalizedSearch =
    search.trim().toLowerCase();

  const visibleEnrollments =
    eligibleEnrollments.filter(
      (enrollment) => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          enrollment.studentName,
          enrollment.studentEmail,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      },
    );

  const selectedEnrollment =
    eligibleEnrollments.find(
      (enrollment) =>
        enrollment.studentId ===
        selectedStudentId,
    ) ??
    eligibleEnrollments[0] ??
    null;

  const assessmentGrades =
    selectedAssessment
      ? grades.filter(
          (grade) =>
            grade.assessmentId ===
            selectedAssessment.id,
        )
      : [];

  const gradeByStudentId = new Map(
    assessmentGrades.map(
      (grade) => [
        grade.studentId,
        grade,
      ],
    ),
  );

  const gradedCount =
    assessmentGrades.length;

  const publishedCount =
    assessmentGrades.filter(
      (grade) =>
        grade.status ===
        "published",
    ).length;

  const averagePercentage =
    gradedCount > 0
      ? roundNumber(
          assessmentGrades.reduce(
            (total, grade) =>
              total +
              grade.normalizedPercentage,
            0,
          ) / gradedCount,
        )
      : 0;

  const pendingCount = Math.max(
    eligibleEnrollments.length -
      gradedCount,
    0,
  );

  function findSection(
    sectionId: string,
  ): AcademicSection | undefined {
    return sections.find(
      (section) =>
        section.id === sectionId,
    );
  }

  function getGrade(
    enrollment: TeacherEnrollment,
  ): TeacherGrade | undefined {
    return gradeByStudentId.get(
      enrollment.studentId,
    );
  }

  function getGradeEdit(
    enrollment: TeacherEnrollment,
  ): GradeEdit {
    if (!selectedAssessment) {
      return {
        score: "",
        feedback: "",
        status: "draft",
      };
    }

    const gradeId =
      createTeacherGradeId(
        selectedAssessment.id,
        enrollment.studentId,
      );

    const existingGrade =
      getGrade(enrollment);

    return (
      edits[gradeId] ?? {
        score:
          existingGrade
            ? String(
                existingGrade.score,
              )
            : "",
        feedback:
          existingGrade?.feedback ??
          "",
        status:
          existingGrade?.status ??
          "draft",
      }
    );
  }

  function updateGradeEdit(
    enrollment: TeacherEnrollment,
    changes: Partial<GradeEdit>,
  ) {
    if (!selectedAssessment) {
      return;
    }

    const gradeId =
      createTeacherGradeId(
        selectedAssessment.id,
        enrollment.studentId,
      );

    const current =
      getGradeEdit(enrollment);

    setEdits((previous) => ({
      ...previous,
      [gradeId]: {
        ...current,
        ...changes,
      },
    }));
  }

  async function handleSaveChanges() {
    if (!selectedAssessment) {
      return;
    }

    const changedEnrollments =
      eligibleEnrollments.filter(
        (enrollment) => {
          const gradeId =
            createTeacherGradeId(
              selectedAssessment.id,
              enrollment.studentId,
            );

          return Boolean(
            edits[gradeId],
          );
        },
      );

    const inputs =
      changedEnrollments.map(
        (enrollment) => {
          const gradeId =
            createTeacherGradeId(
              selectedAssessment.id,
              enrollment.studentId,
            );

          const edit =
            edits[gradeId];

          const existingGrade =
            getGrade(enrollment);

          return {
            enrollmentId:
              enrollment.id,
            studentId:
              enrollment.studentId,
            studentName:
              enrollment.studentName,
            studentEmail:
              enrollment.studentEmail,
            courseId:
              enrollment.courseId,
            sectionId:
              enrollment.sectionId,
            assessmentId:
              selectedAssessment.id,
            assessmentTitle:
              selectedAssessment.title,
            score:
              Number(edit.score),
            maxScore:
              selectedAssessment.maxScore,
            weightPercentage:
              selectedAssessment.weightPercentage,
            feedback:
              edit.feedback,
            status:
              edit.status,
            isNew:
              !existingGrade,
          };
        },
      );

    const saved =
      await saveGrades(inputs);

    if (!saved) {
      return;
    }

    const savedGradeIds =
      changedEnrollments.map(
        (enrollment) =>
          createTeacherGradeId(
            selectedAssessment.id,
            enrollment.studentId,
          ),
      );

    setEdits((previous) => {
      const next = {
        ...previous,
      };

      for (const gradeId of savedGradeIds) {
        delete next[gradeId];
      }

      return next;
    });
  }

  async function handlePublishAll() {
    if (!selectedAssessment) {
      return;
    }

    const draftGradeIds =
      assessmentGrades
        .filter(
          (grade) =>
            grade.status === "draft",
        )
        .map((grade) => grade.id);

    if (
      draftGradeIds.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `¿Deseas publicar ${draftGradeIds.length} calificación(es) de "${selectedAssessment.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    const published =
      await publishGrades(
        draftGradeIds,
      );

    if (
      published &&
      selectedAssessment.status !==
        "graded"
    ) {
      await changeAssessmentStatus(
        selectedAssessment.id,
        "graded",
      );
    }
  }

  function changeCourse(
    nextCourseId: string,
  ) {
    setCourseId(nextCourseId);
    setAssessmentId("");
    setSectionFilter("all");
    setSelectedStudentId("");
  }

  function changeAssessment(
    nextAssessmentId: string,
  ) {
    setAssessmentId(
      nextAssessmentId,
    );

    setSectionFilter("all");
    setSelectedStudentId("");
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
            Cargando libro de notas
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Sincronizando estudiantes,
            evaluaciones y calificaciones.
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
              <GraduationCap
                aria-hidden="true"
                className="h-4 w-4"
              />

              Control evaluativo
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Libro de calificaciones
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              Registra notas, publica
              resultados y consulta el aporte
              ponderado de cada estudiante.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <HeroMetric
              value={
                eligibleEnrollments.length
              }
              label="Estudiantes"
            />

            <HeroMetric
              value={gradedCount}
              label="Calificados"
            />

            <HeroMetric
              value={publishedCount}
              label="Publicadas"
            />

            <HeroMetric
              value={`${averagePercentage}%`}
              label="Promedio"
            />
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">
          {error}
        </section>
      )}

      <section className="grid gap-4 rounded-[1.7rem] border border-border bg-card/75 p-5 shadow-sm lg:grid-cols-3">
        <FormSelect
          label="Asignatura"
          value={resolvedCourseId}
          onChange={changeCourse}
        >
          <option value="">
            Seleccionar asignatura
          </option>

          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.code} —{" "}
              {course.name}
            </option>
          ))}
        </FormSelect>

        <FormSelect
          label="Evaluación"
          value={resolvedAssessmentId}
          onChange={changeAssessment}
        >
          <option value="">
            Seleccionar evaluación
          </option>

          {courseAssessments.map(
            (assessment) => (
              <option
                key={assessment.id}
                value={assessment.id}
              >
                {assessment.title} ·{" "}
                {
                  assessment.weightPercentage
                }
                %
              </option>
            ),
          )}
        </FormSelect>

        <FormSelect
          label="Sección"
          value={resolvedSectionFilter}
          disabled={Boolean(
            selectedAssessment?.sectionId,
          )}
          onChange={setSectionFilter}
        >
          <option value="all">
            Todas las secciones
          </option>

          {courseSections.map(
            (section) => (
              <option
                key={section.id}
                value={section.id}
              >
                Sección {section.code}
              </option>
            ),
          )}
        </FormSelect>
      </section>

      {!selectedCourse ? (
        <EmptyState
          icon={BookOpen}
          title="Selecciona una asignatura"
          description="Elige la asignatura que deseas calificar."
        />
      ) : !selectedAssessment ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No hay evaluaciones disponibles"
          description="Crea una evaluación para esta asignatura antes de registrar notas."
        />
      ) : eligibleEnrollments.length ===
        0 ? (
        <EmptyState
          icon={Users}
          title="No hay estudiantes inscritos"
          description="La asignatura o sección seleccionada no tiene inscripciones activas."
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <InformationCard
              icon={Target}
              label="Ponderación"
              value={`${selectedAssessment.weightPercentage}%`}
            />

            <InformationCard
              icon={Trophy}
              label="Nota máxima"
              value={`${selectedAssessment.maxScore} puntos`}
            />

            <InformationCard
              icon={CheckCircle2}
              label="Nota aprobatoria"
              value={`${selectedAssessment.passingScore} puntos`}
            />

            <InformationCard
              icon={UserCheck}
              label="Pendientes"
              value={`${pendingCount} estudiante(s)`}
            />
          </section>

          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.6fr)]">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card/75 shadow-sm">
              <header className="border-b border-border p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {selectedCourse.code}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      {
                        selectedAssessment.title
                      }
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        visibleEnrollments.length
                      }{" "}
                      estudiante(s) mostrados
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={
                        saving ||
                        assessmentGrades.every(
                          (grade) =>
                            grade.status ===
                            "published",
                        )
                      }
                      onClick={() => {
                        void handlePublishAll();
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-secondary px-4 text-xs font-semibold text-secondary-foreground disabled:pointer-events-none disabled:opacity-45"
                    >
                      <Send
                        aria-hidden="true"
                        className="h-4 w-4"
                      />

                      Publicar todas
                    </button>

                    <button
                      type="button"
                      disabled={
                        saving ||
                        Object.keys(edits)
                          .length === 0
                      }
                      onClick={() => {
                        void handleSaveChanges();
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/15 disabled:pointer-events-none disabled:opacity-45"
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
                </div>

                <div className="relative mt-5">
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
              </header>

              <div className="divide-y divide-border">
                {visibleEnrollments.map(
                  (enrollment) => {
                    const grade =
                      getGrade(enrollment);

                    const edit =
                      getGradeEdit(
                        enrollment,
                      );

                    const numericScore =
                      Number(edit.score);

                    const validScore =
                      edit.score.trim() !==
                        "" &&
                      Number.isFinite(
                        numericScore,
                      ) &&
                      numericScore >= 0 &&
                      numericScore <=
                        selectedAssessment.maxScore;

                    const percentage =
                      validScore
                        ? roundNumber(
                            (numericScore /
                              selectedAssessment.maxScore) *
                              100,
                          )
                        : 0;

                    const weighted =
                      roundNumber(
                        (percentage / 100) *
                          selectedAssessment.weightPercentage,
                      );

                    const selected =
                      selectedEnrollment
                        ?.studentId ===
                      enrollment.studentId;

                    return (
                      <article
                        key={
                          enrollment.id
                        }
                        className={cn(
                          "p-5 transition-all sm:p-6",
                          selected &&
                            "bg-secondary/60",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(
                              enrollment.studentId,
                            );
                          }}
                          className="flex w-full items-center gap-4 text-left"
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

                              {grade && (
                                <GradeStatusBadge
                                  status={
                                    grade.status
                                  }
                                />
                              )}
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

                          <span className="text-xs font-semibold text-muted-foreground">
                            Sección{" "}
                            {findSection(
                              enrollment.sectionId,
                            )?.code ??
                              "—"}
                          </span>
                        </button>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[10rem_10rem_minmax(15rem,1fr)_10rem]">
                          <label>
                            <span className="mb-2 block text-xs font-semibold">
                              Nota
                            </span>

                            <div className="relative">
                              <input
                                type="number"
                                min={0}
                                max={
                                  selectedAssessment.maxScore
                                }
                                step="0.01"
                                value={
                                  edit.score
                                }
                                onChange={(
                                  event,
                                ) => {
                                  updateGradeEdit(
                                    enrollment,
                                    {
                                      score:
                                        event
                                          .target
                                          .value,
                                    },
                                  );
                                }}
                                className={cn(
                                  inputClassName,
                                  edit.score &&
                                    !validScore &&
                                    "border-danger focus:border-danger focus:ring-danger/10",
                                )}
                              />

                              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                /
                                {
                                  selectedAssessment.maxScore
                                }
                              </span>
                            </div>
                          </label>

                          <label>
                            <span className="mb-2 block text-xs font-semibold">
                              Estado
                            </span>

                            <select
                              value={
                                edit.status
                              }
                              onChange={(
                                event,
                              ) => {
                                updateGradeEdit(
                                  enrollment,
                                  {
                                    status:
                                      event
                                        .target
                                        .value as TeacherGradeStatus,
                                  },
                                );
                              }}
                              className={
                                inputClassName
                              }
                            >
                              <option value="draft">
                                Borrador
                              </option>

                              <option value="published">
                                Publicada
                              </option>
                            </select>
                          </label>

                          <label>
                            <span className="mb-2 block text-xs font-semibold">
                              Retroalimentación
                            </span>

                            <input
                              value={
                                edit.feedback
                              }
                              onChange={(
                                event,
                              ) => {
                                updateGradeEdit(
                                  enrollment,
                                  {
                                    feedback:
                                      event
                                        .target
                                        .value,
                                  },
                                );
                              }}
                              placeholder="Observación para el estudiante"
                              className={
                                inputClassName
                              }
                            />
                          </label>

                          <div>
                            <span className="mb-2 block text-xs font-semibold">
                              Resultado
                            </span>

                            <div className="flex h-12 items-center justify-center rounded-2xl border border-border bg-background/70 text-center">
                              <div>
                                <p className="text-xs font-semibold">
                                  {percentage}%
                                </p>

                                <p className="mt-0.5 text-[0.58rem] text-muted-foreground">
                                  aporta{" "}
                                  {weighted}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>

            <aside className="2xl:sticky 2xl:top-24 2xl:self-start">
              {selectedEnrollment && (
                <StudentPerformanceCard
                  enrollment={
                    selectedEnrollment
                  }
                  course={
                    selectedCourse
                  }
                  section={findSection(
                    selectedEnrollment.sectionId,
                  )}
                  assessments={
                    assessments
                  }
                  grades={grades}
                />
              )}
            </aside>
          </section>
        </>
      )}
    </div>
  );
}

interface StudentPerformanceCardProps {
  enrollment: TeacherEnrollment;
  course: AcademicCourse;
  section?: AcademicSection;
  assessments: TeacherAssessment[];
  grades: TeacherGrade[];
}

function StudentPerformanceCard({
  enrollment,
  course,
  section,
  assessments,
  grades,
}: StudentPerformanceCardProps) {
  const applicableAssessments =
    assessments.filter(
      (assessment) =>
        assessment.courseId ===
          enrollment.courseId &&
        assessment.status !==
          "archived" &&
        (
          assessment.sectionId ===
            null ||
          assessment.sectionId ===
            enrollment.sectionId
        ),
    );

  const applicableAssessmentIds =
    new Set(
      applicableAssessments.map(
        (assessment) =>
          assessment.id,
      ),
    );

  const studentGrades =
    grades.filter(
      (grade) =>
        grade.studentId ===
          enrollment.studentId &&
        grade.courseId ===
          enrollment.courseId &&
        applicableAssessmentIds.has(
          grade.assessmentId,
        ),
    );

  const configuredWeight =
    applicableAssessments.reduce(
      (total, assessment) =>
        total +
        assessment.weightPercentage,
      0,
    );

  const gradedWeight =
    studentGrades.reduce(
      (total, grade) =>
        total +
        grade.weightPercentage,
      0,
    );

  const weightedEarned =
    studentGrades.reduce(
      (total, grade) =>
        total +
        grade.weightedPoints,
      0,
    );

  const currentPercentage =
    gradedWeight > 0
      ? roundNumber(
          (weightedEarned /
            gradedWeight) *
            100,
        )
      : 0;

  const currentScore20 =
    roundNumber(
      (currentPercentage / 100) *
        20,
    );

  const accumulatedScore20 =
    roundNumber(
      (weightedEarned / 100) *
        20,
    );

  const isAtRisk =
    gradedWeight > 0 &&
    currentPercentage < 50;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-sm backdrop-blur-xl">
      <header className="relative overflow-hidden bg-[#071a22] p-6 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(45,222,199,0.24),transparent_36%),radial-gradient(circle_at_85%_85%,rgba(117,104,255,0.22),transparent_38%)]"
        />

        <div className="relative z-10">
          <StudentAvatar
            name={
              enrollment.studentName
            }
            large
          />

          <h2 className="mt-5 text-xl font-semibold">
            {enrollment.studentName}
          </h2>

          <p className="mt-2 text-sm text-white/55">
            {enrollment.studentEmail}
          </p>

          {isAtRisk && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ffbe71]/20 bg-[#ffbe71]/10 px-3 py-1.5 text-xs font-semibold text-[#ffd09a]">
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4"
              />

              Bajo rendimiento
            </div>
          )}
        </div>
      </header>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <PerformanceMetric
            icon={BarChart3}
            label="Promedio actual"
            value={`${formatScore(
              currentScore20,
            )}/20`}
          />

          <PerformanceMetric
            icon={Trophy}
            label="Acumulado"
            value={`${formatScore(
              accumulatedScore20,
            )}/20`}
          />

          <PerformanceMetric
            icon={Target}
            label="Peso evaluado"
            value={`${gradedWeight}%`}
          />

          <PerformanceMetric
            icon={Layers3}
            label="Peso configurado"
            value={`${configuredWeight}%`}
          />
        </div>

        <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Información académica
          </p>

          <div className="mt-4 space-y-3 text-xs">
            <InformationRow
              label="Asignatura"
              value={`${course.code} — ${course.name}`}
            />

            <InformationRow
              label="Sección"
              value={
                section
                  ? `Sección ${section.code}`
                  : "No disponible"
              }
            />

            <InformationRow
              label="Evaluaciones calificadas"
              value={`${studentGrades.length}/${applicableAssessments.length}`}
            />
          </div>
        </section>

        <section className="mt-5 rounded-[1.4rem] border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Rendimiento
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Promedio sobre las
                evaluaciones calificadas
              </p>
            </div>

            <span
              className={cn(
                "text-lg font-semibold",
                currentPercentage >= 50
                  ? "text-primary"
                  : "text-danger",
              )}
            >
              {currentPercentage}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                currentPercentage >= 50
                  ? "bg-primary"
                  : "bg-danger",
              )}
              style={{
                width: `${Math.min(
                  currentPercentage,
                  100,
                )}%`,
              }}
            />
          </div>
        </section>

        <div className="mt-5 space-y-2">
          {studentGrades.map(
            (grade) => (
              <div
                key={grade.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {
                      grade.assessmentTitle
                    }
                  </p>

                  <p className="mt-1 text-[0.62rem] text-muted-foreground">
                    {
                      grade.weightPercentage
                    }
                    % de ponderación
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold">
                    {formatScore(
                      grade.score,
                    )}
                    /
                    {formatScore(
                      grade.maxScore,
                    )}
                  </p>

                  <p className="mt-1 text-[0.62rem] text-primary">
                    {
                      grade.weightedPoints
                    }
                    % acumulado
                  </p>
                </div>
              </div>
            ),
          )}

          {studentGrades.length ===
            0 && (
            <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              El estudiante todavía no tiene
              evaluaciones calificadas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function GradeStatusBadge({
  status,
}: {
  status: TeacherGradeStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold",
        status === "published"
          ? "border-primary/20 bg-secondary text-secondary-foreground"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {status === "published" && (
        <Eye
          aria-hidden="true"
          className="mr-1 h-3 w-3"
        />
      )}

      {gradeStatusLabels[status]}
    </span>
  );
}

function FormSelect({
  label,
  value,
  disabled = false,
  onChange,
  children,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (
    value: string,
  ) => void;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-semibold">
        {label}
      </span>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(
            event.target.value,
          );
        }}
        className={cn(
          inputClassName,
          "disabled:cursor-not-allowed disabled:opacity-55",
        )}
      >
        {children}
      </select>
    </label>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <section className="flex min-h-[26rem] items-center justify-center rounded-[2rem] border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-secondary text-secondary-foreground">
          <Icon
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <h2 className="mt-6 text-2xl font-semibold">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  );
}

function InformationCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border bg-card/70 p-5 shadow-sm">
      <Icon
        aria-hidden="true"
        className="h-5 w-5 text-primary"
      />

      <p className="mt-4 text-lg font-semibold">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function PerformanceMetric({
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

      <p className="mt-3 text-xs font-semibold">
        {value}
      </p>

      <p className="mt-1 text-[0.6rem] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="text-right font-semibold">
        {value}
      </span>
    </div>
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

const inputClassName =
  "h-12 w-full rounded-2xl border border-border bg-background/70 px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";