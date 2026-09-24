import type { User } from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import type { ExamAnswer } from "@/data/exams";
import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";
import type {
  ExamAttemptRecord,
  ExamProgressRecord,
  ExamResult,
  ExamSubmissionReason,
  StartExamResponse,
  SubmitExamResponse,
} from "@/types/exam-attempt";

export interface ExamAttemptPatch {
  answers?: Record<
    string,
    ExamAnswer
  >;
  flaggedQuestionIds?: string[];
  currentQuestionIndex?: number;
  remainingSeconds?: number;
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

function safeResult(
  value: unknown,
): ExamResult | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const data =
    value as Record<string, unknown>;

  return {
    score: safeNumber(data.score),
    earnedPoints: safeNumber(
      data.earnedPoints,
    ),
    totalPoints: safeNumber(
      data.totalPoints,
    ),
    correctAnswers: safeNumber(
      data.correctAnswers,
    ),
    answeredQuestions: safeNumber(
      data.answeredQuestions,
    ),
    passed: data.passed === true,
  };
}

export function subscribeToExamProgress(
  userId: string,
  examId: string,
  onData: (
    progress:
      | ExamProgressRecord
      | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const progressReference = doc(
    db,
    "users",
    userId,
    "examProgress",
    examId,
  );

  return onSnapshot(
    progressReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const data = snapshot.data();

      onData({
        examId,
        attemptsUsed: safeNumber(
          data.attemptsUsed,
        ),
        activeAttemptId:
          typeof data.activeAttemptId ===
          "string"
            ? data.activeAttemptId
            : null,
        lastAttemptId:
          typeof data.lastAttemptId ===
          "string"
            ? data.lastAttemptId
            : null,
        lastScore: safeNullableNumber(
          data.lastScore,
        ),
        bestScore: safeNullableNumber(
          data.bestScore,
        ),
        status:
          data.status ===
          "in-progress"
            ? "in-progress"
            : data.status ===
                "completed"
              ? "completed"
              : "not-started",
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export function subscribeToExamAttempt(
  userId: string,
  attemptId: string,
  onData: (
    attempt:
      | ExamAttemptRecord
      | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const attemptReference = doc(
    db,
    "users",
    userId,
    "examAttempts",
    attemptId,
  );

  return onSnapshot(
    attemptReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const data = snapshot.data();

      onData({
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
          typeof data.courseId ===
          "string"
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
        currentQuestionIndex:
          safeNumber(
            data.currentQuestionIndex,
          ),
        answers: safeAnswers(
          data.answers,
        ),
        flaggedQuestionIds:
          safeStringArray(
            data.flaggedQuestionIds,
          ),
        durationSeconds: safeNumber(
          data.durationSeconds,
        ),
        remainingSeconds:
          safeNumber(
            data.remainingSeconds,
          ),
        startedAtMs: safeNumber(
          data.startedAtMs,
        ),
        result: safeResult(
          data.result,
        ),
        submissionReason:
          data.submissionReason ===
            "manual" ||
          data.submissionReason ===
            "time-expired"
            ? data.submissionReason
            : null,
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export async function saveExamAttemptPatch(
  userId: string,
  attemptId: string,
  patch: ExamAttemptPatch,
) {
  assertFirebaseConfigured();

  const attemptReference = doc(
    db,
    "users",
    userId,
    "examAttempts",
    attemptId,
  );

  await setDoc(
    attemptReference,
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

async function parseApiResponse<T>(
  response: Response,
): Promise<T> {
  const result: unknown =
    await response.json();

  if (!response.ok) {
    let errorMessage =
      "La solicitud no pudo completarse.";

    if (
      typeof result === "object" &&
      result !== null &&
      "error" in result
    ) {
      const errorValue = (
        result as {
          error?: unknown;
        }
      ).error;

      if (typeof errorValue === "string") {
        errorMessage = errorValue;
      }
    }

    throw new Error(errorMessage);
  }

  return result as T;
}

export async function requestExamStart(
  user: User,
  examId: string,
) {
  const idToken =
    await user.getIdToken();

  const response = await fetch(
    `/api/exams/${examId}/start`,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${idToken}`,
      },
    },
  );

  return parseApiResponse<StartExamResponse>(
    response,
  );
}

export async function requestExamSubmit(
  user: User,
  examId: string,
  attemptId: string,
  submissionReason:
    ExamSubmissionReason,
) {
  const idToken =
    await user.getIdToken();

  const response = await fetch(
    `/api/exams/${examId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization:
          `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        attemptId,
        submissionReason,
      }),
    },
  );

  return parseApiResponse<SubmitExamResponse>(
    response,
  );
}