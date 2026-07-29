import type { Metadata } from "next";

import { RoleWelcome } from "@/components/auth/role-welcome";

export const metadata: Metadata = {
  title: "Portal estudiantil",
};

export default function StudentPage() {
  return (
    <RoleWelcome
      role="student"
      title="Tu salón virtual está preparado."
      description="En el próximo sprint construiremos la experiencia estudiantil con materias, progreso, próximas clases, actividades pendientes y acceso al aula."
    />
  );
}