import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Evaluaciones",
};

export default function TeacherAssessmentsPage() {
  return (
    <TeacherModulePlaceholder
      icon={ClipboardCheck}
      eyebrow="Evaluación académica"
      title="Evaluaciones y calificaciones"
      description="Diseña actividades evaluativas, configura ponderaciones y administra las calificaciones de tus estudiantes."
      features={[
        "Crear evaluaciones gráficas.",
        "Definir ponderaciones y fechas.",
        "Crear rúbricas de evaluación.",
        "Calcular promedios automáticamente.",
      ]}
    />
  );
}