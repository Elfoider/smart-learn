import type { Metadata } from "next";
import { Users } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Estudiantes",
};

export default function TeacherStudentsPage() {
  return (
    <TeacherModulePlaceholder
      icon={Users}
      eyebrow="Gestión estudiantil"
      title="Estudiantes inscritos"
      description="Consulta, registra y vincula estudiantes a las asignaturas y secciones bajo tu responsabilidad."
      features={[
        "Buscar estudiantes por nombre o correo.",
        "Vincular estudiantes a una sección.",
        "Consultar rendimiento individual.",
        "Detectar estudiantes que requieren seguimiento.",
      ]}
    />
  );
}