import type { Metadata } from "next";

import { TeacherStudentManager } from "@/components/teacher/teacher-student-manager";

export const metadata: Metadata = {
  title: "Estudiantes e inscripciones",
  description:
    "Gestión de estudiantes vinculados a las asignaturas y secciones del docente.",
};

export default function TeacherStudentsPage() {
  return <TeacherStudentManager />;
}