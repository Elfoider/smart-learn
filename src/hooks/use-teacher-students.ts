"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  createEnrollmentRequest,
  fetchTeacherEnrollments,
  searchTeacherStudents,
  updateEnrollmentRequest,
} from "@/lib/firebase/teacher-student-service";
import type {
  CreateTeacherEnrollmentInput,
  StudentDirectoryItem,
  TeacherEnrollment,
  UpdateTeacherEnrollmentInput,
} from "@/types/student-enrollment";

export function useTeacherStudents() {
  const { user } = useAuth();

  const [
    enrollments,
    setEnrollments,
  ] = useState<TeacherEnrollment[]>(
    [],
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [searching, setSearching] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    async function loadEnrollments() {
      try {
        const nextEnrollments =
          await fetchTeacherEnrollments(
            user!,
          );

        if (!active) {
          return;
        }

        setEnrollments(
          nextEnrollments,
        );

        setError(null);
      } catch (loadError) {
        console.error(
          "Error cargando inscripciones:",
          loadError,
        );

        if (!active) {
          return;
        }

        setError(
          "No fue posible cargar los estudiantes.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEnrollments();

    return () => {
      active = false;
    };
  }, [user]);

  async function refreshEnrollments() {
    if (!user) {
      return;
    }

    setLoading(true);

    try {
      const nextEnrollments =
        await fetchTeacherEnrollments(
          user,
        );

      setEnrollments(
        nextEnrollments,
      );

      setError(null);
    } catch (refreshError) {
      console.error(
        "Error actualizando inscripciones:",
        refreshError,
      );

      setError(
        "No fue posible actualizar los estudiantes.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function searchStudents(
    search: string,
  ): Promise<StudentDirectoryItem[]> {
    if (!user) {
      toast.error(
        "La sesión docente no está disponible",
      );

      return [];
    }

    if (search.trim().length < 2) {
      toast.error(
        "Escribe al menos dos caracteres",
      );

      return [];
    }

    setSearching(true);

    try {
      return await searchTeacherStudents(
        user,
        search,
      );
    } catch (searchError) {
      console.error(
        "Error buscando estudiantes:",
        searchError,
      );

      toast.error(
        "No fue posible buscar estudiantes",
        {
          description:
            searchError instanceof Error
              ? searchError.message
              : undefined,
        },
      );

      return [];
    } finally {
      setSearching(false);
    }
  }

  async function createEnrollment(
    input: CreateTeacherEnrollmentInput,
  ) {
    if (!user) {
      toast.error(
        "La sesión docente no está disponible",
      );

      return false;
    }

    setSaving(true);

    try {
      const enrollment =
        await createEnrollmentRequest(
          user,
          input,
        );

      setEnrollments((current) => {
        const remaining =
          current.filter(
            (item) =>
              item.id !==
              enrollment.id,
          );

        return [
          enrollment,
          ...remaining,
        ];
      });

      toast.success(
        "Estudiante vinculado",
        {
          description:
            "La inscripción fue registrada correctamente.",
        },
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error vinculando estudiante:",
        operationError,
      );

      toast.error(
        "No fue posible vincular al estudiante",
        {
          description:
            operationError instanceof
            Error
              ? operationError.message
              : undefined,
        },
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updateEnrollment(
    input: UpdateTeacherEnrollmentInput,
  ) {
    if (!user) {
      toast.error(
        "La sesión docente no está disponible",
      );

      return false;
    }

    setSaving(true);

    try {
      const enrollment =
        await updateEnrollmentRequest(
          user,
          input,
        );

      setEnrollments((current) =>
        current.map((item) =>
          item.id === enrollment.id
            ? enrollment
            : item,
        ),
      );

      toast.success(
        "Inscripción actualizada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error actualizando inscripción:",
        operationError,
      );

      toast.error(
        "No fue posible actualizar la inscripción",
        {
          description:
            operationError instanceof
            Error
              ? operationError.message
              : undefined,
        },
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    enrollments,
    loading,
    saving,
    searching,
    error,
    refreshEnrollments,
    searchStudents,
    createEnrollment,
    updateEnrollment,
  };
}