import type { Metadata } from "next";

import { TeacherPlanningManager } from "@/components/teacher/teacher-planning-manager";

export const metadata: Metadata = {
  title: "Planificación docente",
  description:
    "Gestión de objetivos, contenidos, estrategias y actividades académicas.",
};

export default function TeacherPlanningPage() {
  return <TeacherPlanningManager />;
}