import { NextResponse } from "next/server";

import {
  EnrollmentAdminError,
  searchStudentDirectory,
} from "@/lib/server/teacher-enrollment-admin";
import {
  requireActiveTeacher,
  TeacherApiError,
} from "@/lib/server/teacher-api-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
) {
  try {
    await requireActiveTeacher(
      request,
    );

    const url = new URL(request.url);

    const search =
      url.searchParams.get("q") ?? "";

    const students =
      await searchStudentDirectory(
        search,
      );

    return NextResponse.json({
      students,
    });
  } catch (error) {
    if (
      error instanceof
      TeacherApiError ||
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
      "Error buscando estudiantes:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "No fue posible buscar estudiantes.",
      },
      {
        status: 500,
      },
    );
  }
}