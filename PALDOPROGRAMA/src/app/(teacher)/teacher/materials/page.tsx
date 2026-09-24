import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Materiales",
};

export default function TeacherMaterialsPage() {
  return (
    <TeacherModulePlaceholder
      icon={GraduationCap}
      eyebrow="Recursos académicos"
      title="Materiales y clases"
      description="Publica documentos, videos, enlaces, grabaciones y recursos complementarios para tus estudiantes."
      features={[
        "Subir documentos y guías.",
        "Publicar videos o enlaces externos.",
        "Organizar recursos por unidad.",
        "Controlar la visibilidad para estudiantes.",
      ]}
    />
  );
}