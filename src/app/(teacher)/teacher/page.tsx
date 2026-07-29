import type { Metadata } from "next";

import { RoleWelcome } from "@/components/auth/role-welcome";

export const metadata: Metadata = {
  title: "Portal docente",
};

export default function TeacherPage() {
  return (
    <RoleWelcome
      role="teacher"
      title="Tu centro de gestión docente está preparado."
      description="Más adelante construiremos aquí la administración de asignaturas, estudiantes, planificaciones, evaluaciones, asistencia, reportes y herramientas de inteligencia artificial."
    />
  );
}