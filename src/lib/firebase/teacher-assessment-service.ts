import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";
import type {
  AssessmentRubricCriterion,
  TeacherAssessment,
  TeacherAssessmentDeliveryMode,
  TeacherAssessmentFormValues,
  TeacherAssessmentStatus,
  TeacherAssessmentType,
} from "@/types/teacher-assessment";

function safeTimestampMillis(
  value: unknown,
): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return 0;
}

function safeNullableTimestampMillis(
  value: unknown,
): number | null {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return null;
}

function safeNumber(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function safeAssessmentType(
  value: unknown,
): TeacherAssessmentType {
  if (
    value === "quiz" ||
    value === "workshop" ||
    value === "project" ||
    value === "presentation" ||
    value === "practice" ||
    value === "assignment"
  ) {
    return value;
  }

  return "exam";
}

function safeDeliveryMode(
  value: unknown,
): TeacherAssessmentDeliveryMode {
  return value === "manual"
    ? "manual"
    : "online";
}

function safeAssessmentStatus(
  value: unknown,
): TeacherAssessmentStatus {
  if (
    value === "scheduled" ||
    value === "open" ||
    value === "closed" ||
    value === "graded" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function safeRubric(
  value: unknown,
): AssessmentRubricCriterion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return null;
      }

      const data =
        item as Record<string, unknown>;

      return {
        id:
          typeof data.id === "string"
            ? data.id
            : `criterion-${index + 1}`,

        title:
          typeof data.title === "string"
            ? data.title
            : "",

        description:
          typeof data.description === "string"
            ? data.description
            : "",

        points: safeNumber(
          data.points,
        ),
      } satisfies AssessmentRubricCriterion;
    })
    .filter(
      (
        item,
      ): item is AssessmentRubricCriterion =>
        item !== null &&
        item.title.trim().length > 0,
    );
}

function normalizeRubric(
  rubric: AssessmentRubricCriterion[],
): AssessmentRubricCriterion[] {
  return rubric
    .map((criterion) => ({
      id: criterion.id,
      title: criterion.title.trim(),
      description:
        criterion.description.trim(),
      points: criterion.points,
    }))
    .filter(
      (criterion) =>
        criterion.title.length > 0,
    );
}

function parseAssessment(
  id: string,
  data: DocumentData,
): TeacherAssessment {
  return {
    id,

    teacherId:
      typeof data.teacherId === "string"
        ? data.teacherId
        : "",

    courseId:
      typeof data.courseId === "string"
        ? data.courseId
        : "",

    sectionId:
      typeof data.sectionId === "string"
        ? data.sectionId
        : null,

    title:
      typeof data.title === "string"
        ? data.title
        : "",

    description:
      typeof data.description === "string"
        ? data.description
        : "",

    instructions:
      typeof data.instructions === "string"
        ? data.instructions
        : "",

    type: safeAssessmentType(
      data.type,
    ),

    deliveryMode: safeDeliveryMode(
      data.deliveryMode,
    ),

    weightPercentage: safeNumber(
      data.weightPercentage,
    ),

    maxScore: safeNumber(
      data.maxScore,
      20,
    ),

    passingScore: safeNumber(
      data.passingScore,
      10,
    ),

    opensAt:
      typeof data.opensAt === "string"
        ? data.opensAt
        : "",

    closesAt:
      typeof data.closesAt === "string"
        ? data.closesAt
        : "",

    durationMinutes: safeNumber(
      data.durationMinutes,
      60,
    ),

    attemptsAllowed: safeNumber(
      data.attemptsAllowed,
      1,
    ),

    rubric: safeRubric(
      data.rubric,
    ),

    status: safeAssessmentStatus(
      data.status,
    ),

    visibleToStudents:
      data.visibleToStudents === true,

    createdAtMs:
      safeTimestampMillis(
        data.createdAt,
      ),

    updatedAtMs:
      safeTimestampMillis(
        data.updatedAt,
      ),

    publishedAtMs:
      safeNullableTimestampMillis(
        data.publishedAt,
      ),
  };
}

export function subscribeToTeacherAssessments(
  teacherId: string,
  onData: (
    assessments: TeacherAssessment[],
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const assessmentsQuery = query(
    collection(
      db,
      "assessments",
    ),
    where(
      "teacherId",
      "==",
      teacherId,
    ),
  );

  return onSnapshot(
    assessmentsQuery,
    (snapshot) => {
      const assessments =
        snapshot.docs
          .map((assessmentDocument) =>
            parseAssessment(
              assessmentDocument.id,
              assessmentDocument.data(),
            ),
          )
          .sort(
            (first, second) => {
              if (
                first.opensAt &&
                second.opensAt &&
                first.opensAt !==
                  second.opensAt
              ) {
                return first.opensAt.localeCompare(
                  second.opensAt,
                );
              }

              return (
                second.updatedAtMs -
                first.updatedAtMs
              );
            },
          );

      onData(assessments);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createTeacherAssessment(
  teacherId: string,
  values: TeacherAssessmentFormValues,
): Promise<string> {
  assertFirebaseConfigured();

  const reference = await addDoc(
    collection(
      db,
      "assessments",
    ),
    {
      teacherId,

      courseId:
        values.courseId,

      sectionId:
        values.sectionId || null,

      title:
        values.title.trim(),

      description:
        values.description.trim(),

      instructions:
        values.instructions.trim(),

      type:
        values.type,

      deliveryMode:
        values.deliveryMode,

      weightPercentage:
        values.weightPercentage,

      maxScore:
        values.maxScore,

      passingScore:
        values.passingScore,

      opensAt:
        values.opensAt,

      closesAt:
        values.closesAt,

      durationMinutes:
        values.durationMinutes,

      attemptsAllowed:
        values.attemptsAllowed,

      rubric:
        normalizeRubric(
          values.rubric,
        ),

      status:
        values.status,

      visibleToStudents:
        values.status === "archived"
          ? false
          : values.visibleToStudents,

      publishedAt:
        values.status !== "archived" &&
        values.visibleToStudents
          ? serverTimestamp()
          : null,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  return reference.id;
}

export async function updateTeacherAssessment(
  assessmentId: string,
  values: TeacherAssessmentFormValues,
): Promise<void> {
  assertFirebaseConfigured();

  await updateDoc(
    doc(
      db,
      "assessments",
      assessmentId,
    ),
    {
      courseId:
        values.courseId,

      sectionId:
        values.sectionId || null,

      title:
        values.title.trim(),

      description:
        values.description.trim(),

      instructions:
        values.instructions.trim(),

      type:
        values.type,

      deliveryMode:
        values.deliveryMode,

      weightPercentage:
        values.weightPercentage,

      maxScore:
        values.maxScore,

      passingScore:
        values.passingScore,

      opensAt:
        values.opensAt,

      closesAt:
        values.closesAt,

      durationMinutes:
        values.durationMinutes,

      attemptsAllowed:
        values.attemptsAllowed,

      rubric:
        normalizeRubric(
          values.rubric,
        ),

      status:
        values.status,

      visibleToStudents:
        values.status === "archived"
          ? false
          : values.visibleToStudents,

      publishedAt:
        values.status !== "archived" &&
        values.visibleToStudents
          ? serverTimestamp()
          : null,

      updatedAt:
        serverTimestamp(),
    },
  );
}

export async function setTeacherAssessmentStatus(
  assessmentId: string,
  status: TeacherAssessmentStatus,
): Promise<void> {
  assertFirebaseConfigured();

  const changes: Record<
    string,
    unknown
  > = {
    status,
    updatedAt:
      serverTimestamp(),
  };

  if (status === "archived") {
    changes.visibleToStudents = false;
    changes.publishedAt = null;
  }

  await updateDoc(
    doc(
      db,
      "assessments",
      assessmentId,
    ),
    changes,
  );
}

export async function setTeacherAssessmentVisibility(
  assessmentId: string,
  visibleToStudents: boolean,
): Promise<void> {
  assertFirebaseConfigured();

  await updateDoc(
    doc(
      db,
      "assessments",
      assessmentId,
    ),
    {
      visibleToStudents,

      publishedAt:
        visibleToStudents
          ? serverTimestamp()
          : null,

      updatedAt:
        serverTimestamp(),
    },
  );
}

export async function duplicateTeacherAssessment(
  teacherId: string,
  assessment: TeacherAssessment,
): Promise<string> {
  assertFirebaseConfigured();

  const reference = await addDoc(
    collection(
      db,
      "assessments",
    ),
    {
      teacherId,

      courseId:
        assessment.courseId,

      sectionId:
        assessment.sectionId,

      title:
        `${assessment.title} (copia)`,

      description:
        assessment.description,

      instructions:
        assessment.instructions,

      type:
        assessment.type,

      deliveryMode:
        assessment.deliveryMode,

      /*
       * Se duplica con ponderación 0
       * para no superar automáticamente
       * el 100% del curso o sección.
       */
      weightPercentage: 0,

      maxScore:
        assessment.maxScore,

      passingScore:
        assessment.passingScore,

      opensAt:
        assessment.opensAt,

      closesAt:
        assessment.closesAt,

      durationMinutes:
        assessment.durationMinutes,

      attemptsAllowed:
        assessment.attemptsAllowed,

      rubric:
        normalizeRubric(
          assessment.rubric,
        ),

      status:
        "draft",

      visibleToStudents:
        false,

      publishedAt:
        null,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );

  return reference.id;
}