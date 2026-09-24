import type { User } from "firebase/auth";

import type {
  CreateTeacherEnrollmentInput,
  StudentDirectoryItem,
  StudentSearchResponse,
  TeacherEnrollment,
  TeacherEnrollmentListResponse,
  TeacherEnrollmentResponse,
  UpdateTeacherEnrollmentInput,
} from "@/types/student-enrollment";

async function parseApiResponse<T>(
  response: Response,
): Promise<T> {
  const result: unknown =
    await response.json();

  if (!response.ok) {
    let errorMessage =
      "La solicitud no pudo completarse.";

    if (
      typeof result === "object" &&
      result !== null &&
      "error" in result
    ) {
      const errorValue = (
        result as {
          error?: unknown;
        }
      ).error;

      if (
        typeof errorValue === "string"
      ) {
        errorMessage = errorValue;
      }
    }

    throw new Error(errorMessage);
  }

  return result as T;
}

async function getAuthorizationHeader(
  user: User,
) {
  const token =
    await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchTeacherEnrollments(
  user: User,
): Promise<TeacherEnrollment[]> {
  const authorization =
    await getAuthorizationHeader(user);

  const response = await fetch(
    "/api/teacher/enrollments",
    {
      method: "GET",
      headers: authorization,
      cache: "no-store",
    },
  );

  const result =
    await parseApiResponse<TeacherEnrollmentListResponse>(
      response,
    );

  return result.enrollments;
}

export async function searchTeacherStudents(
  user: User,
  search: string,
): Promise<StudentDirectoryItem[]> {
  const authorization =
    await getAuthorizationHeader(user);

  const response = await fetch(
    `/api/teacher/students/search?q=${encodeURIComponent(
      search,
    )}`,
    {
      method: "GET",
      headers: authorization,
      cache: "no-store",
    },
  );

  const result =
    await parseApiResponse<StudentSearchResponse>(
      response,
    );

  return result.students;
}

export async function createEnrollmentRequest(
  user: User,
  input: CreateTeacherEnrollmentInput,
): Promise<TeacherEnrollment> {
  const authorization =
    await getAuthorizationHeader(user);

  const response = await fetch(
    "/api/teacher/enrollments",
    {
      method: "POST",
      headers: {
        ...authorization,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result =
    await parseApiResponse<TeacherEnrollmentResponse>(
      response,
    );

  return result.enrollment;
}

export async function updateEnrollmentRequest(
  user: User,
  input: UpdateTeacherEnrollmentInput,
): Promise<TeacherEnrollment> {
  const authorization =
    await getAuthorizationHeader(user);

  const response = await fetch(
    "/api/teacher/enrollments",
    {
      method: "PATCH",
      headers: {
        ...authorization,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result =
    await parseApiResponse<TeacherEnrollmentResponse>(
      response,
    );

  return result.enrollment;
}