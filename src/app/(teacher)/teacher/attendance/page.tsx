import type { Metadata } from "next";
import { CalendarCheck2 } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Asistencia",
};

export default function TeacherAttendancePage() {
  return (
    <TeacherModulePlaceholder
      icon={CalendarCheck2}
      eyebrow="Control académico"
      title="Registro de asistencia"
      description="Registra y consulta la asistencia de cada estudiante por fecha, clase y sección."
      features={[
        "Crear registros por fecha y sección.",
        "Marcar presente, ausente o justificado.",
        "Consultar porcentajes de asistencia.",
        "Detectar ausencias consecutivas.",
      ]}
    />
  );
}