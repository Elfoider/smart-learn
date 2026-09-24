"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  createTeacherPlan,
  duplicateTeacherPlan,
  setTeacherPlanStatus,
  setTeacherPlanVisibility,
  subscribeToTeacherPlans,
  updateTeacherPlan,
} from "@/lib/firebase/teacher-planning-service";
import type {
  LessonPlanFormValues,
  LessonPlanStatus,
  TeacherLessonPlan,
} from "@/types/teacher-planning";

export function useTeacherPlans() {
  const { profile } = useAuth();
  const teacherId = profile?.uid;

  const [plans, setPlans] =
    useState<TeacherLessonPlan[]>([]);

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

    return subscribeToTeacherPlans(
      teacherId,
      (nextPlans) => {
        setPlans(nextPlans);
        setLoaded(true);
        setError(null);
      },
      (subscriptionError) => {
        console.error(
          "Error cargando planificaciones:",
          subscriptionError,
        );

        setLoaded(true);

        setError(
          "No fue posible cargar las planificaciones.",
        );
      },
    );
  }, [teacherId]);

  async function createPlan(
    values: LessonPlanFormValues,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    setSaving(true);

    try {
      const planId =
        await createTeacherPlan(
          teacherId,
          values,
        );

      toast.success(
        "Planificación creada",
        {
          description:
            "El plan de clase fue guardado en Firestore.",
        },
      );

      return planId;
    } catch (operationError) {
      console.error(
        "Error creando planificación:",
        operationError,
      );

      toast.error(
        "No fue posible crear la planificación",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function editPlan(
    planId: string,
    values: LessonPlanFormValues,
  ) {
    setSaving(true);

    try {
      await updateTeacherPlan(
        planId,
        values,
      );

      toast.success(
        "Planificación actualizada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error actualizando planificación:",
        operationError,
      );

      toast.error(
        "No fue posible actualizar la planificación",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    planId: string,
    status: LessonPlanStatus,
  ) {
    setSaving(true);

    try {
      await setTeacherPlanStatus(
        planId,
        status,
      );

      toast.success(
        status === "completed"
          ? "Planificación completada"
          : status === "archived"
            ? "Planificación archivada"
            : status === "in-progress"
              ? "Planificación iniciada"
              : status === "scheduled"
                ? "Planificación programada"
                : "Planificación guardada como borrador",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error cambiando estado:",
        operationError,
      );

      toast.error(
        "No fue posible cambiar el estado",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeVisibility(
    planId: string,
    visible: boolean,
  ) {
    setSaving(true);

    try {
      await setTeacherPlanVisibility(
        planId,
        visible,
      );

      toast.success(
        visible
          ? "Planificación visible para estudiantes"
          : "Planificación oculta para estudiantes",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error cambiando visibilidad:",
        operationError,
      );

      toast.error(
        "No fue posible cambiar la visibilidad",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function duplicatePlan(
    plan: TeacherLessonPlan,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    setSaving(true);

    try {
      const planId =
        await duplicateTeacherPlan(
          teacherId,
          plan,
        );

      toast.success(
        "Planificación duplicada",
        {
          description:
            "La copia fue guardada como borrador.",
        },
      );

      return planId;
    } catch (operationError) {
      console.error(
        "Error duplicando planificación:",
        operationError,
      );

      toast.error(
        "No fue posible duplicar la planificación",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  return {
    plans,
    loading: !loaded,
    saving,
    error,
    createPlan,
    editPlan,
    changeStatus,
    changeVisibility,
    duplicatePlan,
  };
}