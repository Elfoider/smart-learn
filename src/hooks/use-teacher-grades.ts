"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  publishTeacherGrades,
  saveTeacherGrades,
  subscribeToTeacherGrades,
} from "@/lib/firebase/teacher-grade-service";
import type {
  SaveTeacherGradeInput,
  TeacherGrade,
} from "@/types/teacher-grade";

export function useTeacherGrades() {
  const { profile } = useAuth();
  const teacherId = profile?.uid;

  const [grades, setGrades] =
    useState<TeacherGrade[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    return subscribeToTeacherGrades(
      teacherId,
      (nextGrades) => {
        setGrades(nextGrades);
        setLoaded(true);
        setError(null);
      },
      (subscriptionError) => {
        console.error(
          "Error cargando calificaciones:",
          subscriptionError,
        );

        setLoaded(true);

        setError(
          "No fue posible cargar las calificaciones.",
        );
      },
    );
  }, [teacherId]);

  async function saveGrades(
    inputs: SaveTeacherGradeInput[],
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return false;
    }

    if (inputs.length === 0) {
      toast.info(
        "No hay cambios pendientes",
      );

      return false;
    }

    const invalidGrade =
      inputs.find(
        (input) =>
          !Number.isFinite(
            input.score,
          ) ||
          input.score < 0 ||
          input.score >
            input.maxScore,
      );

    if (invalidGrade) {
      toast.error(
        "Existe una calificación inválida",
        {
          description:
            `La nota de ${invalidGrade.studentName} ` +
            `debe estar entre 0 y ${invalidGrade.maxScore}.`,
        },
      );

      return false;
    }

    setSaving(true);

    try {
      await saveTeacherGrades(
        teacherId,
        inputs,
      );

      toast.success(
        inputs.length === 1
          ? "Calificación guardada"
          : `${inputs.length} calificaciones guardadas`,
        {
          description:
            "Los promedios fueron recalculados automáticamente.",
        },
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error guardando calificaciones:",
        operationError,
      );

      toast.error(
        "No fue posible guardar las calificaciones",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function publishGrades(
    gradeIds: string[],
  ) {
    if (gradeIds.length === 0) {
      toast.info(
        "No hay calificaciones en borrador",
      );

      return false;
    }

    setSaving(true);

    try {
      await publishTeacherGrades(
        gradeIds,
      );

      toast.success(
        "Calificaciones publicadas",
        {
          description:
            "Los estudiantes ya pueden consultar sus resultados.",
        },
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error publicando calificaciones:",
        operationError,
      );

      toast.error(
        "No fue posible publicar las calificaciones",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    grades,
    loading: !loaded,
    saving,
    error,
    saveGrades,
    publishGrades,
  };
}