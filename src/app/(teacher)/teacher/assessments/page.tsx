import type { Metadata } from "next";

import { TeacherAssessmentWorkspace } from "@/components/teacher/teacher-assessment-workspace";

export const metadata: Metadata = {
  title:
    "Evaluaciones y calificaciones",
  description:
    "Gestión docente de evaluaciones, rúbricas, ponderaciones y calificaciones.",
};

export default function TeacherAssessmentsPage() {
  return (
    <TeacherAssessmentWorkspace />
  );
}