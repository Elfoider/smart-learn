import type { Metadata } from "next";

import { StudentHome } from "@/components/student/student-home";

export const metadata: Metadata = {
  title: "Mi salón",
  description:
    "Portal estudiantil y salón virtual de Smart Learn.",
};

export default function StudentPage() {
  return <StudentHome />;
}
