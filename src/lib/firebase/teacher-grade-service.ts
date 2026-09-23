import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";
import type {
  SaveTeacherGradeInput,
  TeacherGrade,
  TeacherGradeStatus,
} from "@/types/teacher-grade";

const MAX_BATCH_SIZE = 400;

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

function safeGradeStatus(
  value: unknown,
): TeacherGradeStatus {
  return value === "published"
    ? "published"
    : "draft";
}

function roundNumber(
  value: number,
  decimals = 2,
): number {
  const factor = 10 ** decimals;

  return (
    Math.round(
      (value + Number.EPSILON) *
        factor,
    ) / factor
  );
}

function parseTeacherGrade(
  id: string,
  data: DocumentData,
): TeacherGrade {
  return {
    id,

    teacherId:
      typeof data.teacherId === "string"
        ? data.teacherId
        : "",

    enrollmentId:
      typeof data.enrollmentId ===
      "string"
        ? data.enrollmentId
        : "",

    studentId:
      typeof data.studentId === "string"
        ? data.studentId
        : "",

    studentName:
      typeof data.studentName ===
      "string"
        ? data.studentName
        : "Estudiante",

    studentEmail:
      typeof data.studentEmail ===
      "string"
        ? data.studentEmail
        : "",

    courseId:
      typeof data.courseId === "string"
        ? data.courseId
        : "",

    sectionId:
      typeof data.sectionId === "string"
        ? data.sectionId
        : "",

    assessmentId:
      typeof data.assessmentId ===
      "string"
        ? data.assessmentId
        : "",

    assessmentTitle:
      typeof data.assessmentTitle ===
      "string"
        ? data.assessmentTitle
        : "Evaluación",

    score: safeNumber(
      data.score,
    ),

    maxScore: safeNumber(
      data.maxScore,
      20,
    ),

    weightPercentage: safeNumber(
      data.weightPercentage,
    ),

    normalizedPercentage: safeNumber(
      data.normalizedPercentage,
    ),

    weightedPoints: safeNumber(
      data.weightedPoints,
    ),

    feedback:
      typeof data.feedback === "string"
        ? data.feedback
        : "",

    status: safeGradeStatus(
      data.status,
    ),

    gradedAtMs:
      safeTimestampMillis(
        data.gradedAt,
      ),

    publishedAtMs:
      safeNullableTimestampMillis(
        data.publishedAt,
      ),

    createdAtMs:
      safeTimestampMillis(
        data.createdAt,
      ),

    updatedAtMs:
      safeTimestampMillis(
        data.updatedAt,
      ),
  };
}

function splitIntoChunks<T>(
  values: T[],
  size: number,
): T[][] {
  const chunks: T[][] = [];

  for (
    let index = 0;
    index < values.length;
    index += size
  ) {
    chunks.push(
      values.slice(
        index,
        index + size,
      ),
    );
  }

  return chunks;
}

export function createTeacherGradeId(
  assessmentId: string,
  studentId: string,
): string {
  return `${assessmentId}--${studentId}`;
}

export function subscribeToTeacherGrades(
  teacherId: string,
  onData: (
    grades: TeacherGrade[],
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const gradesQuery = query(
    collection(
      db,
      "grades",
    ),
    where(
      "teacherId",
      "==",
      teacherId,
    ),
  );

  return onSnapshot(
    gradesQuery,
    (snapshot) => {
      const grades = snapshot.docs
        .map((gradeDocument) =>
          parseTeacherGrade(
            gradeDocument.id,
            gradeDocument.data(),
          ),
        )
        .sort(
          (first, second) =>
            second.updatedAtMs -
            first.updatedAtMs,
        );

      onData(grades);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function saveTeacherGrades(
  teacherId: string,
  inputs: SaveTeacherGradeInput[],
): Promise<void> {
  assertFirebaseConfigured();

  const chunks = splitIntoChunks(
    inputs,
    MAX_BATCH_SIZE,
  );

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const input of chunk) {
      const gradeId =
        createTeacherGradeId(
          input.assessmentId,
          input.studentId,
        );

      const gradeReference = doc(
        db,
        "grades",
        gradeId,
      );

      const normalizedPercentage =
        input.maxScore > 0
          ? roundNumber(
              (input.score /
                input.maxScore) *
                100,
            )
          : 0;

      const weightedPoints =
        roundNumber(
          (normalizedPercentage /
            100) *
            input.weightPercentage,
        );

      const gradeData: Record<
        string,
        unknown
      > = {
        teacherId,
        enrollmentId:
          input.enrollmentId,
        studentId:
          input.studentId,
        studentName:
          input.studentName.trim(),
        studentEmail:
          input.studentEmail.trim(),
        courseId:
          input.courseId,
        sectionId:
          input.sectionId,
        assessmentId:
          input.assessmentId,
        assessmentTitle:
          input.assessmentTitle.trim(),
        score:
          input.score,
        maxScore:
          input.maxScore,
        weightPercentage:
          input.weightPercentage,
        normalizedPercentage,
        weightedPoints,
        feedback:
          input.feedback.trim(),
        status:
          input.status,
        gradedAt:
          serverTimestamp(),
        publishedAt:
          input.status ===
          "published"
            ? serverTimestamp()
            : null,
        updatedAt:
          serverTimestamp(),
      };

      if (input.isNew) {
        gradeData.createdAt =
          serverTimestamp();
      }

      batch.set(
        gradeReference,
        gradeData,
        {
          merge: true,
        },
      );
    }

    await batch.commit();
  }
}

export async function publishTeacherGrades(
  gradeIds: string[],
): Promise<void> {
  assertFirebaseConfigured();

  const uniqueGradeIds = [
    ...new Set(gradeIds),
  ];

  const chunks = splitIntoChunks(
    uniqueGradeIds,
    MAX_BATCH_SIZE,
  );

  for (const chunk of chunks) {
    const batch = writeBatch(db);

    for (const gradeId of chunk) {
      batch.update(
        doc(
          db,
          "grades",
          gradeId,
        ),
        {
          status: "published",
          publishedAt:
            serverTimestamp(),
          updatedAt:
            serverTimestamp(),
        },
      );
    }

    await batch.commit();
  }
}