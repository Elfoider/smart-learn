import { NextResponse } from "next/server";

import { getStudentExam } from "@/data/exams";
import {
  ExamAttemptError,
  startExamForStudent,
} from "@/lib/server/exam-attempt-admin";
import {
  requireActiveStudent,
  StudentApiError,
} from "@/lib/server/student-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StartExamRouteContext {
  params: Promise<{
    examId: string;
  }>;
}

export async function POST(
  request: Request,
  context: StartExamRouteContext,
) {
  try {
    const { examId } =
      await context.params;

    const exam =
      getStudentExam(examId);

    if (
      !exam ||
      exam.status !== "available" ||
      exam.questions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "La evaluación no está disponible.",
        },
        {
          status: 404,
        },
      );
    }

    const { userId } =
      await requireActiveStudent(
        request,
      );

    const result =
      await startExamForStudent(
        userId,
        exam,
      );

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof
      StudentApiError
    ) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    if (
      error instanceof
      ExamAttemptError
    ) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "Error iniciando evaluación:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible iniciar la evaluación.",
      },
      {
        status: 500,
      },
    );
  }
}