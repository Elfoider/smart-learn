import type { Metadata } from "next";

import { StudentDashboard } from "@/components/student/student-dashboard";
import { LiveCourses } from "@/components/student/live-courses";

export const metadata: Metadata = {
  title: "Mi salón",
  description:
    "Portal estudiantil y salón virtual de Smart Learn.",
};

export default function StudentPage() {
  return <div className="space-y-10">
    <LiveCourses />
    <section><h2 className="mb-3 text-xl font-semibold">Recorrido de demostración</h2>
      <p className="mb-5 text-sm text-muted-foreground">Las clases, actividades y estadísticas siguientes son ejemplos de interfaz.</p>
      <StudentDashboard />
    </section>
  </div>;
}
