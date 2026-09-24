import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Asistente IA docente",
};

export default function TeacherAiPage() {
  return (
    <TeacherModulePlaceholder
      icon={Bot}
      eyebrow="Tecnologías emergentes"
      title="Copiloto académico docente"
      description="Genera borradores académicos con asistencia inteligente y contenido contextualizado a tus materias."
      features={[
        "Generar planificaciones de clase.",
        "Crear rúbricas y actividades.",
        "Proponer estrategias pedagógicas.",
        "Editar y aprobar los resultados antes de publicar.",
      ]}
    />
  );
}