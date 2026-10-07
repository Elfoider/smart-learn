import type { Metadata } from "next";

import { PublishedAssessments } from "@/components/student/published-assessments";

import { ExamCatalog } from "@/components/exams/exam-catalog";

export const metadata: Metadata = {
  title: "Evaluaciones",
  description:
    "Evaluaciones académicas y resultados del estudiante.",
};

export default function StudentExamsPage() {
  return <div className="space-y-8"><PublishedAssessments /><details className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold">Evaluaciones de demostración</summary><p className="mt-3 text-sm text-muted-foreground">Banco fijo para explorar el prototipo. Sus resultados no forman parte de las calificaciones publicadas por tu docente.</p><ExamCatalog /></details></div>;
}