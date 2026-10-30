import type { Metadata } from "next";

import { LiveCourses } from "@/components/student/live-courses";

export const metadata: Metadata = {
  title: "Mi salón",
  description:
    "Portal estudiantil y salón virtual de Smart Learn.",
};

export default function StudentPage() {
  return <LiveCourses home />;
}
