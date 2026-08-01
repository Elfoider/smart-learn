"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  addTeacherSection,
  createTeacherCourse,
  setTeacherCourseStatus,
  setTeacherSectionStatus,
  subscribeToTeacherCourses,
  subscribeToTeacherSections,
  updateTeacherCourse,
  updateTeacherSection,
} from "@/lib/firebase/teacher-course-service";
import type {
  AcademicCourse,
  AcademicCourseStatus,
  AcademicSection,
  AcademicSectionStatus,
  CourseFormValues,
  CreateTeacherCourseInput,
  SectionFormValues,
} from "@/types/academic-course";

export function useTeacherCourses() {
  const { profile } = useAuth();
  const teacherId = profile?.uid;

  const [courses, setCourses] =
    useState<AcademicCourse[]>([]);

  const [sections, setSections] =
    useState<AcademicSection[]>([]);

  const [
    coursesLoaded,
    setCoursesLoaded,
  ] = useState(false);

  const [
    sectionsLoaded,
    setSectionsLoaded,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    const unsubscribeCourses =
      subscribeToTeacherCourses(
        teacherId,
        (nextCourses) => {
          setCourses(nextCourses);
          setCoursesLoaded(true);
          setError(null);
        },
        (subscriptionError) => {
          console.error(
            "Error cargando asignaturas:",
            subscriptionError,
          );

          setCoursesLoaded(true);
          setError(
            "No fue posible cargar las asignaturas.",
          );
        },
      );

    const unsubscribeSections =
      subscribeToTeacherSections(
        teacherId,
        (nextSections) => {
          setSections(nextSections);
          setSectionsLoaded(true);
          setError(null);
        },
        (subscriptionError) => {
          console.error(
            "Error cargando secciones:",
            subscriptionError,
          );

          setSectionsLoaded(true);
          setError(
            "No fue posible cargar las secciones.",
          );
        },
      );

    return () => {
      unsubscribeCourses();
      unsubscribeSections();
    };
  }, [teacherId]);

  async function createCourse(
    input: CreateTeacherCourseInput,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    setSaving(true);

    try {
      const courseId =
        await createTeacherCourse(
          teacherId,
          input,
        );

      toast.success(
        "Asignatura creada",
        {
          description:
            "La materia y su primera sección fueron guardadas.",
        },
      );

      return courseId;
    } catch (operationError) {
      console.error(
        "Error creando asignatura:",
        operationError,
      );

      toast.error(
        "No fue posible crear la asignatura",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function editCourse(
    courseId: string,
    values: CourseFormValues,
  ) {
    setSaving(true);

    try {
      await updateTeacherCourse(
        courseId,
        values,
      );

      toast.success(
        "Asignatura actualizada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error actualizando asignatura:",
        operationError,
      );

      toast.error(
        "No fue posible actualizar la asignatura",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeCourseStatus(
    courseId: string,
    status: AcademicCourseStatus,
  ) {
    setSaving(true);

    try {
      await setTeacherCourseStatus(
        courseId,
        status,
      );

      toast.success(
        status === "archived"
          ? "Asignatura archivada"
          : status === "active"
            ? "Asignatura activada"
            : "Asignatura guardada como borrador",
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

  async function createSection(
    courseId: string,
    values: SectionFormValues,
  ) {
    if (!teacherId) {
      toast.error(
        "No se encontró la sesión docente",
      );

      return null;
    }

    setSaving(true);

    try {
      const sectionId =
        await addTeacherSection(
          teacherId,
          courseId,
          values,
        );

      toast.success(
        "Sección agregada",
      );

      return sectionId;
    } catch (operationError) {
      console.error(
        "Error creando sección:",
        operationError,
      );

      toast.error(
        "No fue posible agregar la sección",
      );

      return null;
    } finally {
      setSaving(false);
    }
  }

  async function editSection(
    sectionId: string,
    values: SectionFormValues,
  ) {
    setSaving(true);

    try {
      await updateTeacherSection(
        sectionId,
        values,
      );

      toast.success(
        "Sección actualizada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error actualizando sección:",
        operationError,
      );

      toast.error(
        "No fue posible actualizar la sección",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function changeSectionStatus(
    sectionId: string,
    status: AcademicSectionStatus,
  ) {
    setSaving(true);

    try {
      await setTeacherSectionStatus(
        sectionId,
        status,
      );

      toast.success(
        status === "active"
          ? "Sección activada"
          : "Sección desactivada",
      );

      return true;
    } catch (operationError) {
      console.error(
        "Error cambiando sección:",
        operationError,
      );

      toast.error(
        "No fue posible cambiar la sección",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    courses,
    sections,
    loading:
      !coursesLoaded ||
      !sectionsLoaded,
    saving,
    error,
    createCourse,
    editCourse,
    changeCourseStatus,
    createSection,
    editSection,
    changeSectionStatus,
  };
}