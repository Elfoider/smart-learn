import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Planificación docente",
};

export default function TeacherPlanningPage() {
  return (
    <TeacherModulePlaceholder
      icon={FileText}
      eyebrow="Organización académica"
      title="Planificación docente"
      description="Organiza objetivos, contenidos, estrategias, recursos y actividades para cada unidad académica."
      features={[
        "Crear planes de clase por unidad.",
        "Definir objetivos y contenidos.",
        "Registrar estrategias y recursos.",
        "Generar borradores mediante inteligencia artificial.",
      ]}
    />
  );
}