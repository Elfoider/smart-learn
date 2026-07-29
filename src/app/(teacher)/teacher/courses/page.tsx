import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

import { TeacherModulePlaceholder } from "@/components/teacher/teacher-module-placeholder";

export const metadata: Metadata = {
  title: "Asignaturas y secciones",
};

export default function TeacherCoursesPage() {
  return (
    <TeacherModulePlaceholder
      icon={BookOpen}
      eyebrow="Gestión de asignaturas"
      title="Asignaturas y secciones"
      description="Administra la carga académica, los períodos, las secciones y el contenido base de cada materia."
      features={[
        "Crear y editar asignaturas.",
        "Configurar secciones y períodos académicos.",
        "Definir horarios, aula y modalidad.",
        "Consultar estudiantes inscritos por sección.",
      ]}
    />
  );
}