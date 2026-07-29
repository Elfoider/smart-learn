import { NextResponse } from "next/server";
import { z } from "zod";

import { getStudentExam } from "@/data/exams";
import {
  ExamAttemptError,
  submitExamForStudent,
} from "@/lib/server/exam-attempt-admin";
import {
  requireActiveStudent,
  StudentApiError,
} from "@/lib/server/student-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submitExamSchema = z.object({
  attemptId: z
    .string()
    .trim()
    .min(1)
    .max(200),

  submissionReason: z.enum([
    "manual",
    "time-expired",
  ]),
});

interface SubmitExamRouteContext {
  params: Promise<{
    examId: string;
  }>;
}

export async function POST(
  request: Request,
  context: SubmitExamRouteContext,
) {
  try {
    const { examId } =
      await context.params;

    const exam =
      getStudentExam(examId);

    if (
      !exam ||
      exam.questions.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "La evaluación no existe.",
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

    const body = await request.json();

    const parsed =
      submitExamSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Los datos de entrega no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await submitExamForStudent(
        userId,
        exam,
        parsed.data.attemptId,
        parsed.data.submissionReason,
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
      "Error entregando evaluación:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible entregar la evaluación.",
      },
      {
        status: 500,
      },
    );
  }
}