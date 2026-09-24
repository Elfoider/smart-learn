"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  createPlaygroundSessionId,
  savePlaygroundSession,
  subscribeToPlaygroundSession,
  type PlaygroundSessionRecord,
} from "@/lib/firebase/playground-service";

interface UsePlaygroundSessionOptions {
  courseId: string;
  topicId: string;
  initialExerciseId: string;
}

export function usePlaygroundSession({
  courseId,
  topicId,
  initialExerciseId,
}: UsePlaygroundSessionOptions) {
  const { profile } = useAuth();
  const userId = profile?.uid;

  const sessionId =
    createPlaygroundSessionId(
      courseId,
      topicId,
    );

  const emptySession: PlaygroundSessionRecord = {
    sessionId,
    courseId,
    topicId,
    currentExerciseId:
      initialExerciseId,
    completedExerciseIds: [],
    attempts: 0,
    correctAnswers: 0,
    totalHintsUsed: 0,
  };

  const [session, setSession] =
    useState<PlaygroundSessionRecord>(
      emptySession,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToPlaygroundSession(
      userId,
      sessionId,
      (savedSession) => {
        if (savedSession) {
          setSession({
            ...savedSession,
            courseId,
            topicId,
            currentExerciseId:
              savedSession.currentExerciseId ||
              initialExerciseId,
          });
        } else {
          setSession({
            sessionId,
            courseId,
            topicId,
            currentExerciseId:
              initialExerciseId,
            completedExerciseIds: [],
            attempts: 0,
            correctAnswers: 0,
            totalHintsUsed: 0,
          });
        }

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error cargando playground:",
          error,
        );

        setLoading(false);

        toast.error(
          "No fue posible sincronizar la práctica",
        );
      },
    );
  }, [
    courseId,
    initialExerciseId,
    sessionId,
    topicId,
    userId,
  ]);

  async function persistSession(
    nextSession: PlaygroundSessionRecord,
  ) {
    setSession(nextSession);

    if (!userId) {
      return;
    }

    setSaving(true);

    try {
      await savePlaygroundSession(
        userId,
        nextSession,
      );
    } catch (error) {
      console.error(
        "Error guardando playground:",
        error,
      );

      toast.error(
        "No fue posible guardar la sesión",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openExercise(
    exerciseId: string,
  ) {
    await persistSession({
      ...session,
      currentExerciseId: exerciseId,
    });
  }

  async function recordAttempt(
    exerciseId: string,
    correct: boolean,
    hintsUsed: number,
  ) {
    const alreadyCompleted =
      session.completedExerciseIds.includes(
        exerciseId,
      );

    const completedExerciseIds =
      correct && !alreadyCompleted
        ? [
            ...session.completedExerciseIds,
            exerciseId,
          ]
        : session.completedExerciseIds;

    await persistSession({
      ...session,
      currentExerciseId: exerciseId,
      completedExerciseIds,
      attempts: session.attempts + 1,
      correctAnswers:
        session.correctAnswers +
        (correct ? 1 : 0),
      totalHintsUsed:
        session.totalHintsUsed +
        hintsUsed,
    });
  }

  async function resetSession() {
    await persistSession({
      sessionId,
      courseId,
      topicId,
      currentExerciseId:
        initialExerciseId,
      completedExerciseIds: [],
      attempts: 0,
      correctAnswers: 0,
      totalHintsUsed: 0,
    });

    toast.success(
      "Sesión reiniciada",
    );
  }

  return {
    session,
    loading,
    saving,
    openExercise,
    recordAttempt,
    resetSession,
  };
}