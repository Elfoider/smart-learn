import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { StudentPlaceholder } from "@/components/student/student-placeholder";

export const metadata: Metadata = {
  title: "Mi progreso",
};

export default function StudentProgressPage() {
  return (
    <StudentPlaceholder
      eyebrow="Seguimiento académico"
      title="Comprende tus avances y oportunidades de mejora."
      description="Aquí se visualizará el progreso por materia, actividades completadas, tiempo de estudio, resultados de prácticas y recomendaciones personalizadas."
      icon={BarChart3}
    />
  );
}