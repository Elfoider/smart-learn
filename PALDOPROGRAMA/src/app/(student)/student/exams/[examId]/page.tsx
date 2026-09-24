import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GraphicalExam } from "@/components/exams/graphical-exam";
import {
  getStudentExam,
  studentExams,
} from "@/data/exams";

interface ExamPageProps {
  params: Promise<{
    examId: string;
  }>;
}

export function generateStaticParams() {
  return studentExams
    .filter(
      (exam) =>
        exam.status === "available",
    )
    .map((exam) => ({
      examId: exam.id,
    }));
}

export async function generateMetadata({
  params,
}: ExamPageProps): Promise<Metadata> {
  const { examId } = await params;

  const exam =
    getStudentExam(examId);

  if (!exam) {
    return {
      title:
        "Evaluación no encontrada",
    };
  }

  return {
    title: exam.title,
    description: exam.description,
  };
}

export default async function ExamPage({
  params,
}: ExamPageProps) {
  const { examId } = await params;

  const exam =
    getStudentExam(examId);

  if (
    !exam ||
    exam.status !== "available" ||
    exam.questions.length === 0
  ) {
    notFound();
  }

  return (
    <GraphicalExam exam={exam} />
  );
}