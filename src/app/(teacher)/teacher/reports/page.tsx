import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Reportes",
};

export default function TeacherReportsPage() {
  return (
    <TeacherModulePlaceholder
      icon={BarChart3}
      eyebrow="Análisis académico"
      title="Reportes y rendimiento"
      description="Consulta indicadores de rendimiento, asistencia, calificaciones y progreso por asignatura o estudiante."
      features={[
        "Visualizar promedios por sección.",
        "Consultar rendimiento individual.",
        "Analizar asistencia por período.",
        "Exportar evidencias académicas.",
      ]}
    />
  );
}