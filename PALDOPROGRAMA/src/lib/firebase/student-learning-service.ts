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

export interface CourseProgressRecord {
  courseId: string;
  currentLessonId: string;
  completedLessonIds: string[];
}

export interface LessonNoteRecord {
  courseId: string;
  lessonId: string;
  content: string;
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

function createNoteDocumentId(
  courseId: string,
  lessonId: string,
) {
  return `${courseId}--${lessonId}`;
}

export function subscribeToCourseProgress(
  userId: string,
  courseId: string,
  onData: (
    progress: CourseProgressRecord | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const progressReference = doc(
    db,
    "users",
    userId,
    "courseProgress",
    courseId,
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
        courseId,
        currentLessonId:
          typeof data.currentLessonId ===
          "string"
            ? data.currentLessonId
            : "",
        completedLessonIds: onlyStrings(
          data.completedLessonIds,
        ),
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export async function saveCourseProgress(
  userId: string,
  progress: CourseProgressRecord,
) {
  assertFirebaseConfigured();

  const progressReference = doc(
    db,
    "users",
    userId,
    "courseProgress",
    progress.courseId,
  );

  await setDoc(
    progressReference,
    {
      courseId: progress.courseId,
      currentLessonId:
        progress.currentLessonId,
      completedLessonIds:
        progress.completedLessonIds,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export function subscribeToLessonNote(
  userId: string,
  courseId: string,
  lessonId: string,
  onData: (
    note: LessonNoteRecord | null,
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const noteReference = doc(
    db,
    "users",
    userId,
    "lessonNotes",
    createNoteDocumentId(
      courseId,
      lessonId,
    ),
  );

  return onSnapshot(
    noteReference,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }

      const data = snapshot.data();

      onData({
        courseId,
        lessonId,
        content:
          typeof data.content === "string"
            ? data.content
            : "",
      });
    },
    (error) => {
      onError(error);
    },
  );
}

export async function saveLessonNote(
  userId: string,
  note: LessonNoteRecord,
) {
  assertFirebaseConfigured();

  const noteReference = doc(
    db,
    "users",
    userId,
    "lessonNotes",
    createNoteDocumentId(
      note.courseId,
      note.lessonId,
    ),
  );

  await setDoc(
    noteReference,
    {
      courseId: note.courseId,
      lessonId: note.lessonId,
      content: note.content,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}