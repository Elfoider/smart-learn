import type { Metadata } from "next";

import { PublishedAssessments } from "@/components/student/published-assessments";



export const metadata: Metadata = {
  title: "Evaluaciones",
  description:
    "Evaluaciones académicas y resultados del estudiante.",
};

export default function StudentExamsPage() {
  return <PublishedAssessments />;
}
