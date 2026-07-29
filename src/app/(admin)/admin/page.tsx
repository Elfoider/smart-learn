import type { Metadata } from "next";

import { RoleWelcome } from "@/components/auth/role-welcome";

export const metadata: Metadata = {
  title: "Administración",
};

export default function AdminPage() {
  return (
    <RoleWelcome
      role="admin"
      title="El control institucional está preparado."
      description="Este espacio permitirá administrar usuarios, roles, parámetros académicos, configuraciones generales y supervisión del funcionamiento de Smart Learn."
    />
  );
}