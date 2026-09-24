import type { Metadata } from "next";

import { StudentDashboard } from "@/components/student/student-dashboard";

export const metadata: Metadata = {
  title: "Mi salón",
  description:
    "Portal estudiantil y salón virtual de Smart Learn.",
};

export default function StudentPage() {
  return <StudentDashboard />;
}