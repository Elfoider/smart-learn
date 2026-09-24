import {
  FieldValue,
  type DocumentData,
} from "firebase-admin/firestore";

import type {
  StudentExam,
  ExamAnswer,
} from "@/data/exams";
import { calculateExamResult } from "@/lib/exams/exam-scoring";
import { getAdminDb } from "@/lib/firebase/admin";
import type {
  ExamAttemptRecord,
  ExamProgressRecord,
  ExamSubmissionReason,
  StartExamResponse,
  SubmitExamResponse,
} from "@/types/exam-attempt";

export class ExamAttemptError extends Error {
  status: number;
  code: string;

  constructor(
    code: string,
    message: string,
    status = 400,
  ) {
    super(message);

    this.name = "ExamAttemptError";
    this.code = code;
    this.status = status;
  }
}

function safeNumber(
  value: unknown,
  fallback = 0,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function safeNullableNumber(
  value: unknown,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : null;
}

function safeStringArray(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function safeAnswers(
  value: unknown,
): Record<string, ExamAnswer> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const result: Record<
    string,
    ExamAnswer
  > = {};

  Object.entries(value).forEach(
    ([key, answer]) => {
      if (typeof answer === "string") {
        result[key] = answer;
        return;
      }

      if (
        Array.isArray(answer) &&
        answer.every(
          (item) =>
            typeof item === "string",
        )
      ) {
        result[key] = answer;
      }
    },
  );

  return result;
}

function parseAttempt(
  attemptId: string,
  data: DocumentData,
): ExamAttemptRecord {
  const resultData =
    data.result &&
    typeof data.result === "object"
      ? data.result
      : null;

  return {
    attemptId,
    userId:
      typeof data.userId === "string"
        ? data.userId
        : "",
    examId:
      typeof data.examId === "string"
        ? data.examId
        : "",
    courseId:
      typeof data.courseId === "string"
        ? data.courseId
        : "",
    status:
      data.status === "submitted"
        ? "submitted"
        : "active",
    attemptNumber: safeNumber(
      data.attemptNumber,
      1,
    ),
    currentQuestionIndex: safeNumber(
      data.currentQuestionIndex,
    ),
    answers: safeAnswers(data.answers),
    flaggedQuestionIds:
      safeStringArray(
        data.flaggedQuestionIds,
      ),
    durationSeconds: safeNumber(
      data.durationSeconds,
    ),
    remainingSeconds: safeNumber(
      data.remainingSeconds,
    ),
    startedAtMs: safeNumber(
      data.startedAtMs,
    ),
    result: resultData
      ? {
          score: safeNumber(
            resultData.score,
          ),
          earnedPoints: safeNumber(
            resultData.earnedPoints,
          ),
          totalPoints: safeNumber(
            resultData.totalPoints,
          ),
          correctAnswers: safeNumber(
            resultData.correctAnswers,
          ),
          answeredQuestions: safeNumber(
            resultData.answeredQuestions,
          ),
          passed:
            resultData.passed === true,
        }
      : null,
    submissionReason:
      data.submissionReason ===
        "time-expired" ||
      data.submissionReason === "manual"
        ? data.submissionReason
        : null,
  };
}

function parseProgress(
  examId: string,
  data: DocumentData | undefined,
): ExamProgressRecord {
  return {
    examId,
    attemptsUsed: safeNumber(
      data?.attemptsUsed,
    ),
    activeAttemptId:
      typeof data?.activeAttemptId ===
      "string"
        ? data.activeAttemptId
        : null,
    lastAttemptId:
      typeof data?.lastAttemptId ===
      "string"
        ? data.lastAttemptId
        : null,
    lastScore: safeNullableNumber(
      data?.lastScore,
    ),
    bestScore: safeNullableNumber(
      data?.bestScore,
    ),
    status:
      data?.status === "in-progress"
        ? "in-progress"
        : data?.status === "completed"
          ? "completed"
          : "not-started",
  };
}

function getAttemptCollection(
  userId: string,
) {
  return getAdminDb()
    .collection("users")
    .doc(userId)
    .collection("examAttempts");
}

function getProgressReference(
  userId: string,
  examId: string,
) {
  return getAdminDb()
    .collection("users")
    .doc(userId)
    .collection("examProgress")
    .doc(examId);
}

export async function startExamForStudent(
  userId: string,
  exam: StudentExam,
): Promise<StartExamResponse> {
  const db = getAdminDb();

  const progressReference =
    getProgressReference(
      userId,
      exam.id,
    );

  const attemptCollection =
    getAttemptCollection(userId);

  const generatedAttemptReference =
    attemptCollection.doc();

  return db.runTransaction(
    async (transaction) => {
      const progressSnapshot =
        await transaction.get(
          progressReference,
        );

      const currentProgress =
        parseProgress(
          exam.id,
          progressSnapshot.data(),
        );

      if (
        currentProgress.activeAttemptId
      ) {
        const activeAttemptReference =
          attemptCollection.doc(
            currentProgress.activeAttemptId,
          );

        const activeAttemptSnapshot =
          await transaction.get(
            activeAttemptReference,
          );

        if (
          activeAttemptSnapshot.exists
        ) {
          const activeAttempt =
            parseAttempt(
              activeAttemptSnapshot.id,
              activeAttemptSnapshot.data()!,
            );

          if (
            activeAttempt.status ===
            "active"
          ) {
            return {
              attempt: activeAttempt,
              progress:
                currentProgress,
            };
          }
        }
      }

      if (
        currentProgress.attemptsUsed >=
        exam.attemptsAllowed
      ) {
        throw new ExamAttemptError(
          "exam/attempt-limit",
          "Ya utilizaste todos los intentos permitidos.",
          409,
        );
      }

      const attemptNumber =
        currentProgress.attemptsUsed + 1;

      const durationSeconds =
        exam.durationMinutes * 60;

      const attempt:
        ExamAttemptRecord = {
          attemptId:
            generatedAttemptReference.id,
          userId,
          examId: exam.id,
          courseId: exam.courseId,
          status: "active",
          attemptNumber,
          currentQuestionIndex: 0,
          answers: {},
          flaggedQuestionIds: [],
          durationSeconds,
          remainingSeconds:
            durationSeconds,
          startedAtMs: Date.now(),
          result: null,
          submissionReason: null,
        };

      const progress:
        ExamProgressRecord = {
          examId: exam.id,
          attemptsUsed: attemptNumber,
          activeAttemptId:
            attempt.attemptId,
          lastAttemptId:
            attempt.attemptId,
          lastScore:
            currentProgress.lastScore,
          bestScore:
            currentProgress.bestScore,
          status: "in-progress",
        };

      transaction.set(
        generatedAttemptReference,
        {
          ...attempt,
          startedAt:
            FieldValue.serverTimestamp(),
          updatedAt:
            FieldValue.serverTimestamp(),
          result: null,
          submissionReason: null,
        },
      );

      transaction.set(
        progressReference,
        {
          ...progress,
          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      return {
        attempt,
        progress,
      };
    },
  );
}

export async function submitExamForStudent(
  userId: string,
  exam: StudentExam,
  attemptId: string,
  submissionReason:
    ExamSubmissionReason,
): Promise<SubmitExamResponse> {
  const db = getAdminDb();

  const attemptReference =
    getAttemptCollection(userId).doc(
      attemptId,
    );

  const progressReference =
    getProgressReference(
      userId,
      exam.id,
    );

  return db.runTransaction(
    async (transaction) => {
      const attemptSnapshot =
        await transaction.get(
          attemptReference,
        );

      const progressSnapshot =
        await transaction.get(
          progressReference,
        );

      if (!attemptSnapshot.exists) {
        throw new ExamAttemptError(
          "exam/attempt-not-found",
          "No se encontró el intento de evaluación.",
          404,
        );
      }

      const attempt = parseAttempt(
        attemptSnapshot.id,
        attemptSnapshot.data()!,
      );

      if (
        attempt.userId !== userId ||
        attempt.examId !== exam.id
      ) {
        throw new ExamAttemptError(
          "exam/invalid-attempt",
          "El intento no pertenece a esta evaluación.",
          403,
        );
      }

      const currentProgress =
        parseProgress(
          exam.id,
          progressSnapshot.data(),
        );

      if (
        attempt.status ===
          "submitted" &&
        attempt.result
      ) {
        return {
          attempt,
          progress:
            currentProgress,
        };
      }

      const result =
        calculateExamResult(
          exam,
          attempt.answers,
        );

      const submittedAttempt:
        ExamAttemptRecord = {
          ...attempt,
          status: "submitted",
          remainingSeconds:
            submissionReason ===
            "time-expired"
              ? 0
              : attempt.remainingSeconds,
          result,
          submissionReason,
        };

      const previousBest =
        currentProgress.bestScore;

      const bestScore =
        previousBest === null
          ? result.score
          : Math.max(
              previousBest,
              result.score,
            );

      const completedProgress:
        ExamProgressRecord = {
          ...currentProgress,
          examId: exam.id,
          activeAttemptId: null,
          lastAttemptId: attemptId,
          lastScore: result.score,
          bestScore,
          status: "completed",
        };

      transaction.set(
        attemptReference,
        {
          status: "submitted",
          remainingSeconds:
            submittedAttempt.remainingSeconds,
          result,
          submissionReason,
          submittedAt:
            FieldValue.serverTimestamp(),
          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      transaction.set(
        progressReference,
        {
          ...completedProgress,
          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      return {
        attempt: submittedAttempt,
        progress:
          completedProgress,
      };
    },
  );
}