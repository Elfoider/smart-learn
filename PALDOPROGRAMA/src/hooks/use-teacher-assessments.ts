"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  createTeacherAssessment,
  duplicateTeacherAssessment,
  setTeacherAssessmentStatus,
  setTeacherAssessmentVisibility,
  subscribeToTeacherAssessments,
  updateTeacherAssessment,
} from "@/lib/firebase/teacher-assessment-service";
import type {
  TeacherAssessment,
  TeacherAssessmentFormValues,
  TeacherAssessmentStatus,
} from "@/types/teacher-assessment";

function assessmentScopeKey(
  courseId: string,
  sectionId: string | null,
) {
  return `${courseId}::${
    sectionId ?? "all"
  }`;
}

export function useTeacherAssessments() {
  const { profile } = useAuth();
  const teacherId = profile?.uid;

  const [
    assessments,
    setAssessments,
  ] = useState<TeacherAssessment[]>(
    [],
  );

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

    return subscribeToTeacherAssessments(
      teacherId,
      (nextAssessments) => {
        setAssessments(
          nextAssessments,
        );

        setLoaded(true);
        setError(null);
      },
      (subscriptionError) => {
        console.error(
          "Error cargando evaluaciones:",
          subscriptionError,
        );

        setLoaded(true);

        setError(
          "No fue posible cargar las evaluaciones.",
        );
      },
    );
  }, [teacherId]);

  function validateWeight(
    values: TeacherAssessmentFormValues,
    excludedAssessmentId?: string,
  ) {
    if (
      values.status === "archived"
    ) {
      return true;
    }

    const nextScope =
      assessmentScopeKey(
        values.courseId,
        values.sectionId,
      );

    const occupiedWeight =
      assessments
        .filter(
          (assessment) =>
            assessment.id !==
              excludedAssessmentId &&
            assessment.status !==
              "archived" &&
            assessmentScopeKey(
              assessment.courseId,
              assessment.sectionId,
            ) === nextScope,
        )
        .reduce(
          (total, assessment) =>
            total +
            assessment.weightPercentage,
          0,
        );

    const nextTotal =
      occupiedWeight +
      values.weightPercentage;

    if (nextTotal > 100) {
      toast.error(
        "La ponderación supera el 100%",
        {
          description:
            `Este alcance ya utiliza ${occupiedWeight}%. ` +
            `Con la nueva evaluación alcanzaría ${nextTotal}%.`,
        },
      );

      return false;
    }

    return true;
  }

  async function createAssessment(
    values: TeacherAssessmentFormValues,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    if (!validateWeight(values)) {
      return null;
    }

    setSaving(true);

    try {
      const assessmentId =
        await createTeacherAssessment(
          teacherId,
          values,
        );

      toast.success(
        "Evaluación creada",
        {
          description:
            "La actividad y su rúbrica fueron guardadas.",
        },
      );

      return assessmentId;
    } catch (operationError) {
      console.error(
        "Error creando evaluación:",
        operationError,
      );

      toast.error(
        "No fue posible crear la evaluación",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function editAssessment(
    assessmentId: string,
    values: TeacherAssessmentFormValues,
  ) {
    if (
      !validateWeight(
        values,
        assessmentId,
      )
    ) {
      return false;
    }

    setSaving(true);

    try {
      await updateTeacherAssessment(
        assessmentId,
        values,
      );

      toast.success(
        "Evaluación actualizada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error actualizando evaluación:",
        operationError,
      );

      toast.error(
        "No fue posible actualizar la evaluación",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    assessmentId: string,
    status: TeacherAssessmentStatus,
  ) {
    setSaving(true);

    try {
      await setTeacherAssessmentStatus(
        assessmentId,
        status,
      );

      const messages: Record<
        TeacherAssessmentStatus,
        string
      > = {
        draft:
          "Evaluación restaurada como borrador",
        scheduled:
          "Evaluación programada",
        open:
          "Evaluación abierta",
        closed:
          "Evaluación cerrada",
        graded:
          "Evaluación marcada como calificada",
        archived:
          "Evaluación archivada",
      };

      toast.success(
        messages[status],
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
    assessmentId: string,
    visible: boolean,
  ) {
    setSaving(true);

    try {
      await setTeacherAssessmentVisibility(
        assessmentId,
        visible,
      );

      toast.success(
        visible
          ? "Evaluación visible para estudiantes"
          : "Evaluación oculta para estudiantes",
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

  async function duplicateAssessment(
    assessment: TeacherAssessment,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    setSaving(true);

    try {
      const assessmentId =
        await duplicateTeacherAssessment(
          teacherId,
          assessment,
        );

      toast.success(
        "Evaluación duplicada",
        {
          description:
            "La copia fue guardada como borrador y con ponderación 0%.",
        },
      );

      return assessmentId;
    } catch (operationError) {
      console.error(
        "Error duplicando evaluación:",
        operationError,
      );

      toast.error(
        "No fue posible duplicar la evaluación",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  function getScopeWeight(
    courseId: string,
    sectionId: string | null,
    excludedAssessmentId?: string,
  ) {
    const scope =
      assessmentScopeKey(
        courseId,
        sectionId,
      );

    return assessments
      .filter(
        (assessment) =>
          assessment.id !==
            excludedAssessmentId &&
          assessment.status !==
            "archived" &&
          assessmentScopeKey(
            assessment.courseId,
            assessment.sectionId,
          ) === scope,
      )
      .reduce(
        (total, assessment) =>
          total +
          assessment.weightPercentage,
        0,
      );
  }

  return {
    assessments,
    loading: !loaded,
    saving,
    error,
    createAssessment,
    editAssessment,
    changeStatus,
    changeVisibility,
    duplicateAssessment,
    getScopeWeight,
  };
}