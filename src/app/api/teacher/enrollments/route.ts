import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createTeacherEnrollment,
  EnrollmentAdminError,
  listTeacherEnrollments,
  updateTeacherEnrollment,
} from "@/lib/server/teacher-enrollment-admin";
import {
  requireActiveTeacher,
  TeacherApiError,
} from "@/lib/server/teacher-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createEnrollmentSchema =
  z.object({
    studentId: z
      .string()
      .trim()
      .min(1)
      .max(200),

    courseId: z
      .string()
      .trim()
      .min(1)
      .max(200),

    sectionId: z
      .string()
      .trim()
      .min(1)
      .max(200),
  });

const updateEnrollmentSchema =
  z
    .object({
      enrollmentId: z
        .string()
        .trim()
        .min(1)
        .max(450),

      sectionId: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional(),

      status: z
        .enum([
          "active",
          "inactive",
          "completed",
        ])
        .optional(),
    })
    .refine(
      (value) =>
        Boolean(
          value.sectionId ||
            value.status,
        ),
      {
        message:
          "Debes indicar un cambio para la inscripción.",
      },
    );

function handleRouteError(
  error: unknown,
  fallbackMessage: string,
) {
  if (
    error instanceof TeacherApiError ||
    error instanceof
      EnrollmentAdminError
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

  console.error(
    fallbackMessage,
    error,
  );

  return NextResponse.json(
    {
      error: fallbackMessage,
    },
    {
      status: 500,
    },
  );
}

export async function GET(
  request: Request,
) {
  try {
    const { teacherId } =
      await requireActiveTeacher(
        request,
      );

    const enrollments =
      await listTeacherEnrollments(
        teacherId,
      );

    return NextResponse.json({
      enrollments,
    });
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible cargar las inscripciones.",
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const { teacherId } =
      await requireActiveTeacher(
        request,
      );

    const body = await request.json();

    const parsed =
      createEnrollmentSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Los datos de la inscripción no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const enrollment =
      await createTeacherEnrollment(
        teacherId,
        parsed.data,
      );

    return NextResponse.json(
      {
        enrollment,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible registrar al estudiante.",
    );
  }
}

export async function PATCH(
  request: Request,
) {
  try {
    const { teacherId } =
      await requireActiveTeacher(
        request,
      );

    const body = await request.json();

    const parsed =
      updateEnrollmentSchema.safeParse(
        body,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Los cambios enviados no son válidos.",
        },
        {
          status: 400,
        },
      );
    }

    const enrollment =
      await updateTeacherEnrollment(
        teacherId,
        parsed.data,
      );

    return NextResponse.json({
      enrollment,
    });
  } catch (error) {
    return handleRouteError(
      error,
      "No fue posible actualizar la inscripción.",
    );
  }
}