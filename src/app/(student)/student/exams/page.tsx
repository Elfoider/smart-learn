import type { Metadata } from "next";

import { ExamCatalog } from "@/components/exams/exam-catalog";

export const metadata: Metadata = {
  title: "Evaluaciones",
  description:
    "Evaluaciones académicas y resultados del estudiante.",
};

export default function StudentExamsPage() {
  return <ExamCatalog />;
}