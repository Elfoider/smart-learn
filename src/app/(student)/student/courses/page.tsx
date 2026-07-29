import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { StudentPlaceholder } from "@/components/student/student-placeholder";

export const metadata: Metadata = {
  title: "Mis materias",
};

export default function StudentCoursesPage() {
  return (
    <StudentPlaceholder
      eyebrow="Próxima entrega"
      title="Tus aulas estarán organizadas en un solo lugar."
      description="En el siguiente bloque construiremos el listado completo de materias y la experiencia de aula tipo Mastermind, con contenido central, capítulos, lecciones y progreso."
      icon={BookOpen}
    />
  );
}