import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

import { StudentPlaceholder } from "@/components/student/student-placeholder";

export const metadata: Metadata = {
  title: "Playground",
};

export default function StudentPlaygroundPage() {
  return (
    <StudentPlaceholder
      eyebrow="Práctica inteligente"
      title="Aprende practicando con asistencia guiada."
      description="El playground permitirá seleccionar una materia, resolver ejercicios, solicitar pistas y recibir retroalimentación académica generada mediante inteligencia artificial."
      icon={Sparkles}
    />
  );
}