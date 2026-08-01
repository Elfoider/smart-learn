import type { Metadata } from "next";

import { TeacherCourseManager } from "@/components/teacher/teacher-course-manager";

export const metadata: Metadata = {
  title: "Asignaturas y secciones",
  description:
    "Gestión académica de materias y secciones del docente.",
};

export default function TeacherCoursesPage() {
  return <TeacherCourseManager />;
}