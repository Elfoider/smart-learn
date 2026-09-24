import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";

import { StudentPlaceholder } from "@/components/student/student-placeholder";

export const metadata: Metadata = {
  title: "Calendario",
};

export default function StudentCalendarPage() {
  return (
    <StudentPlaceholder
      eyebrow="Agenda estudiantil"
      title="Organiza clases, entregas y evaluaciones."
      description="Este módulo mostrará el calendario académico, las próximas videoclases, actividades pendientes, exámenes y recordatorios personales."
      icon={CalendarDays}
    />
  );
}