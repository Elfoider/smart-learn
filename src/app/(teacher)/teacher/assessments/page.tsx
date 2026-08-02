import type { Metadata } from "next";

import { TeacherAssessmentManager } from "@/components/teacher/teacher-assessment-manager";

export const metadata: Metadata = {
  title: "Evaluaciones y rúbricas",
  description:
    "Gestión docente de evaluaciones, ponderaciones y criterios de calificación.",
};

export default function TeacherAssessmentsPage() {
  return <TeacherAssessmentManager />;
}