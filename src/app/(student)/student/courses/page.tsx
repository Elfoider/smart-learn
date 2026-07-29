import type { Metadata } from "next";

import { CourseCatalog } from "@/components/student/course-catalog";

export const metadata: Metadata = {
  title: "Mis materias",
  description:
    "Materias y aulas virtuales del estudiante.",
};

export default function StudentCoursesPage() {
  return <CourseCatalog />;
}