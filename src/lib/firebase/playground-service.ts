import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";

import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";

export interface PlaygroundSessionRecord {
  sessionId: string;
  courseId: string;
  topicId: string;
  currentExerciseId: string;
  completedExerciseIds: string[];
  attempts: number;
  correctAnswers: number;
  totalHintsUsed: number;
}

function onlyStrings(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function safeNumber(
  value: unknown,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

export function createPlaygroundSessionId(
  courseId: string,
  topicId: string,
) {
  return `${courseId}--${topicId}`;
}

export function subscribeToPlaygroundSession(
  userId: string,
  sessionId: string,
  onData: (
    session:
      | PlaygroundSessionRecord
      | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const sessionReference = doc(
    db,
    "users",
    userId,
    "playgroundSessions",
    sessionId,
  );

  return onSnapshot(
    sessionReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const data = snapshot.data();

      onData({
        sessionId,
        courseId:
          typeof data.courseId === "string"
            ? data.courseId
            : "",
        topicId:
          typeof data.topicId === "string"
            ? data.topicId
            : "",
        currentExerciseId:
          typeof data.currentExerciseId ===
          "string"
            ? data.currentExerciseId
            : "",
        completedExerciseIds: onlyStrings(
          data.completedExerciseIds,
        ),
        attempts: safeNumber(
          data.attempts,
        ),
        correctAnswers: safeNumber(
          data.correctAnswers,
        ),
        totalHintsUsed: safeNumber(
          data.totalHintsUsed,
        ),
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export async function savePlaygroundSession(
  userId: string,
  session: PlaygroundSessionRecord,
) {
  assertFirebaseConfigured();

  const sessionReference = doc(
    db,
    "users",
    userId,
    "playgroundSessions",
    session.sessionId,
  );

  await setDoc(
    sessionReference,
    {
      sessionId: session.sessionId,
      courseId: session.courseId,
      topicId: session.topicId,
      currentExerciseId:
        session.currentExerciseId,
      completedExerciseIds:
        session.completedExerciseIds,
      attempts: session.attempts,
      correctAnswers:
        session.correctAnswers,
      totalHintsUsed:
        session.totalHintsUsed,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}