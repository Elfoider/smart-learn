import type { Metadata } from "next";

import { TeacherDashboard } from "@/components/teacher/teacher-dashboard";

export const metadata: Metadata = {
  title: "Portal docente",
  description:
    "Panel de gestión académica para docentes universitarios.",
};

export default function TeacherPage() {
  return <TeacherDashboard />;
}