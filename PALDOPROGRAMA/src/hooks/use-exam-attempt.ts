"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import type {
  ExamAnswer,
  StudentExam,
} from "@/data/exams";
import { useAuth } from "@/hooks/use-auth";
import {
  requestExamStart,
  requestExamSubmit,
  saveExamAttemptPatch,
  subscribeToExamAttempt,
  subscribeToExamProgress,
  type ExamAttemptPatch,
} from "@/lib/firebase/exam-attempt-service";
import type {
  ExamAttemptRecord,
  ExamProgressRecord,
  ExamSubmissionReason,
} from "@/types/exam-attempt";

export function useExamAttempt(
  exam: StudentExam,
) {
  const { user, profile } = useAuth();
  const userId = profile?.uid;

  const [progress, setProgress] =
    useState<ExamProgressRecord | null>(
      null,
    );

  const [attempt, setAttempt] =
    useState<ExamAttemptRecord | null>(
      null,
    );

  const [progressLoaded, setProgressLoaded] =
    useState(false);

  const [pendingWrites, setPendingWrites] =
    useState(0);

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const attemptRef =
    useRef<ExamAttemptRecord | null>(
      null,
    );

  const submittingRef =
    useRef(false);

  const timeoutAttemptRef =
    useRef<string | null>(null);

  const watchedAttemptId =
    progress?.activeAttemptId ??
    progress?.lastAttemptId ??
    null;

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToExamProgress(
      userId,
      exam.id,
      (nextProgress) => {
        setProgress(nextProgress);
        setProgressLoaded(true);

        const nextAttemptId =
          nextProgress?.activeAttemptId ??
          nextProgress?.lastAttemptId ??
          null;

        if (
          !nextAttemptId ||
          attemptRef.current
            ?.attemptId !==
            nextAttemptId
        ) {
          attemptRef.current = null;
          setAttempt(null);
        }
      },
      (error) => {
        console.error(
          "Error cargando progreso del examen:",
          error,
        );

        setProgressLoaded(true);

        toast.error(
          "No se pudo cargar el examen",
        );
      },
    );
  }, [exam.id, userId]);

  useEffect(() => {
    if (
      !userId ||
      !watchedAttemptId
    ) {
      return;
    }

    return subscribeToExamAttempt(
      userId,
      watchedAttemptId,
      (nextAttempt) => {
        if (!nextAttempt) {
          attemptRef.current = null;
          setAttempt(null);
          return;
        }

        const current =
          attemptRef.current;

        const mergedAttempt =
          current &&
          current.attemptId ===
            nextAttempt.attemptId &&
          current.status === "active" &&
          nextAttempt.status === "active"
            ? {
                ...nextAttempt,
                remainingSeconds:
                  Math.min(
                    current.remainingSeconds,
                    nextAttempt.remainingSeconds,
                  ),
              }
            : nextAttempt;

        attemptRef.current =
          mergedAttempt;

        setAttempt(mergedAttempt);
      },
      (error) => {
        console.error(
          "Error cargando intento:",
          error,
        );

        toast.error(
          "No se pudo recuperar el intento",
        );
      },
    );
  }, [userId, watchedAttemptId]);

  async function persistPatch(
    patch: ExamAttemptPatch,
  ) {
    const current =
      attemptRef.current;

    if (
      !userId ||
      !current ||
      current.status !== "active"
    ) {
      return;
    }

    setPendingWrites(
      (value) => value + 1,
    );

    try {
      await saveExamAttemptPatch(
        userId,
        current.attemptId,
        patch,
      );
    } catch (error) {
      console.error(
        "Error guardando examen:",
        error,
      );

      toast.error(
        "No se pudo guardar el último cambio",
      );
    } finally {
      setPendingWrites((value) =>
        Math.max(value - 1, 0),
      );
    }
  }

  function setLocalAttempt(
    nextAttempt: ExamAttemptRecord,
  ) {
    attemptRef.current = nextAttempt;
    setAttempt(nextAttempt);
  }

  async function startAttempt() {
    if (!user) {
      toast.error(
        "La sesión no está disponible",
      );

      return;
    }

    setStarting(true);

    try {
      const response =
        await requestExamStart(
          user,
          exam.id,
        );

      timeoutAttemptRef.current = null;
      submittingRef.current = false;

      setProgress(response.progress);
      setLocalAttempt(
        response.attempt,
      );
    } catch (error) {
      toast.error(
        "No fue posible iniciar la evaluación",
        {
          description:
            error instanceof Error
              ? error.message
              : undefined,
        },
      );
    } finally {
      setStarting(false);
    }
  }

  function updateAnswer(
    questionId: string,
    answer: ExamAnswer,
  ) {
    const current =
      attemptRef.current;

    if (
      !current ||
      current.status !== "active"
    ) {
      return;
    }

    const answers = {
      ...current.answers,
      [questionId]: answer,
    };

    setLocalAttempt({
      ...current,
      answers,
    });

    void persistPatch({
      answers,
    });
  }

  function setQuestionIndex(
    index: number,
  ) {
    const current =
      attemptRef.current;

    if (
      !current ||
      current.status !== "active"
    ) {
      return;
    }

    const boundedIndex = Math.max(
      0,
      Math.min(
        index,
        exam.questions.length - 1,
      ),
    );

    setLocalAttempt({
      ...current,
      currentQuestionIndex:
        boundedIndex,
    });

    void persistPatch({
      currentQuestionIndex:
        boundedIndex,
    });
  }

  function toggleFlag(
    questionId: string,
  ) {
    const current =
      attemptRef.current;

    if (
      !current ||
      current.status !== "active"
    ) {
      return;
    }

    const flaggedQuestionIds =
      current.flaggedQuestionIds.includes(
        questionId,
      )
        ? current.flaggedQuestionIds.filter(
            (id) => id !== questionId,
          )
        : [
            ...current.flaggedQuestionIds,
            questionId,
          ];

    setLocalAttempt({
      ...current,
      flaggedQuestionIds,
    });

    void persistPatch({
      flaggedQuestionIds,
    });
  }

  async function submitAttempt(
    submissionReason:
      ExamSubmissionReason = "manual",
  ) {
    const current =
      attemptRef.current;

    if (
      !user ||
      !current ||
      current.status !== "active" ||
      submittingRef.current
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      await saveExamAttemptPatch(
        user.uid,
        current.attemptId,
        {
          answers: current.answers,
          flaggedQuestionIds:
            current.flaggedQuestionIds,
          currentQuestionIndex:
            current.currentQuestionIndex,
          remainingSeconds:
            current.remainingSeconds,
        },
      );

      const response =
        await requestExamSubmit(
          user,
          exam.id,
          current.attemptId,
          submissionReason,
        );

      setProgress(response.progress);
      setLocalAttempt(
        response.attempt,
      );

      toast.success(
        "Evaluación entregada correctamente",
      );
    } catch (error) {
      toast.error(
        "No fue posible entregar la evaluación",
        {
          description:
            error instanceof Error
              ? error.message
              : undefined,
        },
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  useEffect(() => {
    const current =
      attemptRef.current;

    if (
      !current ||
      current.status !== "active" ||
      !user
    ) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        const liveAttempt =
          attemptRef.current;

        if (
          !liveAttempt ||
          liveAttempt.status !==
            "active"
        ) {
          return;
        }

        const nextRemainingSeconds =
          Math.max(
            liveAttempt.remainingSeconds -
              1,
            0,
          );

        const nextAttempt = {
          ...liveAttempt,
          remainingSeconds:
            nextRemainingSeconds,
        };

        setLocalAttempt(nextAttempt);

        if (
          nextRemainingSeconds > 0 &&
          nextRemainingSeconds % 5 === 0
        ) {
          setPendingWrites(
            (value) => value + 1,
          );

          void saveExamAttemptPatch(
            user.uid,
            liveAttempt.attemptId,
            {
              remainingSeconds:
                nextRemainingSeconds,
            },
          )
            .catch((error) => {
              console.error(
                "Error guardando temporizador:",
                error,
              );
            })
            .finally(() => {
              setPendingWrites((value) =>
                Math.max(value - 1, 0),
              );
            });
        }

        if (
          nextRemainingSeconds === 0 &&
          timeoutAttemptRef.current !==
            liveAttempt.attemptId
        ) {
          timeoutAttemptRef.current =
            liveAttempt.attemptId;

          window.clearInterval(
            intervalId,
          );

          submittingRef.current = true;
          setSubmitting(true);

          void saveExamAttemptPatch(
            user.uid,
            liveAttempt.attemptId,
            {
              answers:
                nextAttempt.answers,
              flaggedQuestionIds:
                nextAttempt.flaggedQuestionIds,
              currentQuestionIndex:
                nextAttempt.currentQuestionIndex,
              remainingSeconds: 0,
            },
          )
            .then(() =>
              requestExamSubmit(
                user,
                exam.id,
                liveAttempt.attemptId,
                "time-expired",
              ),
            )
            .then((response) => {
              setProgress(
                response.progress,
              );

              setLocalAttempt(
                response.attempt,
              );

              toast.info(
                "El tiempo finalizó",
                {
                  description:
                    "La evaluación fue entregada automáticamente.",
                },
              );
            })
            .catch((error) => {
              console.error(
                "Error entregando por tiempo:",
                error,
              );

              toast.error(
                "El tiempo terminó, pero la entrega no pudo completarse",
                {
                  description:
                    "Presiona Entregar evaluación para intentarlo nuevamente.",
                },
              );
            })
            .finally(() => {
              submittingRef.current =
                false;

              setSubmitting(false);
            });
        }
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [
    attempt?.attemptId,
    attempt?.status,
    exam.id,
    user,
  ]);

  const loading =
    !progressLoaded ||
    Boolean(
      watchedAttemptId &&
        !attempt,
    );

  const attemptsUsed =
    progress?.attemptsUsed ?? 0;

  const attemptsRemaining =
    Math.max(
      exam.attemptsAllowed -
        attemptsUsed,
      0,
    );

  return {
    attempt,
    progress,
    loading,
    saving:
      pendingWrites > 0 ||
      starting ||
      submitting,
    starting,
    submitting,
    attemptsUsed,
    attemptsRemaining,
    startAttempt,
    updateAnswer,
    setQuestionIndex,
    toggleFlag,
    submitAttempt,
  };
}