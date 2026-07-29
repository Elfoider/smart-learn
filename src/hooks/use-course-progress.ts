"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  saveCourseProgress,
  subscribeToCourseProgress,
} from "@/lib/firebase/student-learning-service";

interface UseCourseProgressOptions {
  courseId: string;
  initialCurrentLessonId: string;
  initialCompletedLessonIds: string[];
}

export function useCourseProgress({
  courseId,
  initialCurrentLessonId,
  initialCompletedLessonIds,
}: UseCourseProgressOptions) {
  const { profile } = useAuth();
  const userId = profile?.uid;

  const [
    currentLessonId,
    setCurrentLessonId,
  ] = useState(initialCurrentLessonId);

  const [
    completedLessonIds,
    setCompletedLessonIds,
  ] = useState<string[]>(
    initialCompletedLessonIds,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToCourseProgress(
      userId,
      courseId,
      (progress) => {
        if (progress) {
          if (progress.currentLessonId) {
            setCurrentLessonId(
              progress.currentLessonId,
            );
          }

          setCompletedLessonIds(
            progress.completedLessonIds,
          );
        } else {
          setCurrentLessonId(
            initialCurrentLessonId,
          );

          setCompletedLessonIds(
            initialCompletedLessonIds,
          );
        }

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error sincronizando progreso:",
          error,
        );

        setLoading(false);

        toast.error(
          "No se pudo sincronizar el progreso",
          {
            description:
              "La información local continuará disponible.",
          },
        );
      },
    );
  }, [
    courseId,
    initialCompletedLessonIds,
    initialCurrentLessonId,
    userId,
  ]);

  async function persistProgress(
    nextCurrentLessonId: string,
    nextCompletedLessonIds: string[],
  ) {
    if (!userId) {
      return;
    }

    setSaving(true);

    try {
      await saveCourseProgress(
        userId,
        {
          courseId,
          currentLessonId:
            nextCurrentLessonId,
          completedLessonIds:
            nextCompletedLessonIds,
        },
      );
    } catch (error) {
      console.error(
        "Error guardando progreso:",
        error,
      );

      toast.error(
        "No fue posible guardar el progreso",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openLesson(
    lessonId: string,
  ) {
    setCurrentLessonId(lessonId);

    await persistProgress(
      lessonId,
      completedLessonIds,
    );
  }

  async function toggleLessonCompleted(
    lessonId: string,
  ) {
    const nextCompletedLessonIds =
      completedLessonIds.includes(lessonId)
        ? completedLessonIds.filter(
            (id) => id !== lessonId,
          )
        : [
            ...completedLessonIds,
            lessonId,
          ];

    setCompletedLessonIds(
      nextCompletedLessonIds,
    );

    await persistProgress(
      currentLessonId,
      nextCompletedLessonIds,
    );
  }

  return {
    currentLessonId,
    completedLessonIds,
    loading,
    saving,
    openLesson,
    toggleLessonCompleted,
  };
}