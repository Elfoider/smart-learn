import {
  FieldValue,
  Timestamp,
  type DocumentData,
} from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import type {
  CreateTeacherEnrollmentInput,
  EnrollmentStatus,
  StudentAccountStatus,
  StudentDirectoryItem,
  TeacherEnrollment,
  UpdateTeacherEnrollmentInput,
} from "@/types/student-enrollment";

export class EnrollmentAdminError extends Error {
  status: number;
  code: string;

  constructor(
    code: string,
    message: string,
    status = 400,
  ) {
    super(message);

    this.name = "EnrollmentAdminError";
    this.code = code;
    this.status = status;
  }
}

function safeTimestampMillis(
  value: unknown,
) {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return 0;
}

function safeStudentStatus(
  value: unknown,
): StudentAccountStatus {
  if (
    value === "inactive" ||
    value === "suspended"
  ) {
    return value;
  }

  return "active";
}

function safeEnrollmentStatus(
  value: unknown,
): EnrollmentStatus {
  if (
    value === "inactive" ||
    value === "completed"
  ) {
    return value;
  }

  return "active";
}

function parseEnrollment(
  id: string,
  data: DocumentData,
): TeacherEnrollment {
  return {
    id,
    teacherId:
      typeof data.teacherId === "string"
        ? data.teacherId
        : "",
    studentId:
      typeof data.studentId === "string"
        ? data.studentId
        : "",
    studentName:
      typeof data.studentName ===
      "string"
        ? data.studentName
        : "Estudiante",
    studentEmail:
      typeof data.studentEmail ===
      "string"
        ? data.studentEmail
        : "",
    studentPhotoURL:
      typeof data.studentPhotoURL ===
      "string"
        ? data.studentPhotoURL
        : null,
    courseId:
      typeof data.courseId === "string"
        ? data.courseId
        : "",
    sectionId:
      typeof data.sectionId ===
      "string"
        ? data.sectionId
        : "",
    status: safeEnrollmentStatus(
      data.status,
    ),
    enrolledAtMs:
      safeTimestampMillis(
        data.enrolledAt,
      ),
    updatedAtMs:
      safeTimestampMillis(
        data.updatedAt,
      ),
  };
}

function createEnrollmentId(
  courseId: string,
  studentId: string,
) {
  return `${courseId}--${studentId}`;
}

function normalizeSearch(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}

export async function searchStudentDirectory(
  search: string,
): Promise<StudentDirectoryItem[]> {
  const normalizedSearch =
    normalizeSearch(search);

  if (normalizedSearch.length < 2) {
    return [];
  }

  const snapshot =
    await getAdminDb()
      .collection("users")
      .where("role", "==", "student")
      .limit(100)
      .get();

  return snapshot.docs
    .map((studentDocument) => {
      const data =
        studentDocument.data();

      return {
        id: studentDocument.id,
        name:
          typeof data.name === "string"
            ? data.name
            : "Estudiante",
        email:
          typeof data.email === "string"
            ? data.email
            : "",
        status: safeStudentStatus(
          data.status,
        ),
        photoURL:
          typeof data.photoURL ===
          "string"
            ? data.photoURL
            : null,
      } satisfies StudentDirectoryItem;
    })
    .filter((student) => {
      const searchableText =
        normalizeSearch(
          `${student.name} ${student.email}`,
        );

      return searchableText.includes(
        normalizedSearch,
      );
    })
    .sort((first, second) =>
      first.name.localeCompare(
        second.name,
        "es",
      ),
    )
    .slice(0, 20);
}

export async function listTeacherEnrollments(
  teacherId: string,
): Promise<TeacherEnrollment[]> {
  const snapshot =
    await getAdminDb()
      .collection("enrollments")
      .where(
        "teacherId",
        "==",
        teacherId,
      )
      .get();

  return snapshot.docs
    .map((enrollmentDocument) =>
      parseEnrollment(
        enrollmentDocument.id,
        enrollmentDocument.data(),
      ),
    )
    .sort(
      (first, second) =>
        second.updatedAtMs -
        first.updatedAtMs,
    );
}

export async function createTeacherEnrollment(
  teacherId: string,
  input: CreateTeacherEnrollmentInput,
): Promise<TeacherEnrollment> {
  const db = getAdminDb();

  const courseReference = db
    .collection("courses")
    .doc(input.courseId);

  const sectionReference = db
    .collection("sections")
    .doc(input.sectionId);

  const studentReference = db
    .collection("users")
    .doc(input.studentId);

  const enrollmentId =
    createEnrollmentId(
      input.courseId,
      input.studentId,
    );

  const enrollmentReference = db
    .collection("enrollments")
    .doc(enrollmentId);

  return db.runTransaction(
    async (transaction) => {
      const courseSnapshot =
        await transaction.get(
          courseReference,
        );

      const sectionSnapshot =
        await transaction.get(
          sectionReference,
        );

      const studentSnapshot =
        await transaction.get(
          studentReference,
        );

      const enrollmentSnapshot =
        await transaction.get(
          enrollmentReference,
        );

      if (!courseSnapshot.exists) {
        throw new EnrollmentAdminError(
          "enrollment/course-not-found",
          "La asignatura no existe.",
          404,
        );
      }

      const course =
        courseSnapshot.data();

      if (
        course?.teacherId !== teacherId
      ) {
        throw new EnrollmentAdminError(
          "enrollment/course-forbidden",
          "No puedes administrar esta asignatura.",
          403,
        );
      }

      if (!sectionSnapshot.exists) {
        throw new EnrollmentAdminError(
          "enrollment/section-not-found",
          "La sección no existe.",
          404,
        );
      }

      const section =
        sectionSnapshot.data();

      if (
        section?.teacherId !==
          teacherId ||
        section?.courseId !==
          input.courseId
      ) {
        throw new EnrollmentAdminError(
          "enrollment/invalid-section",
          "La sección no pertenece a la asignatura seleccionada.",
          403,
        );
      }

      if (
        section?.status !== "active"
      ) {
        throw new EnrollmentAdminError(
          "enrollment/inactive-section",
          "La sección seleccionada está inactiva.",
          409,
        );
      }

      if (!studentSnapshot.exists) {
        throw new EnrollmentAdminError(
          "enrollment/student-not-found",
          "El estudiante no existe.",
          404,
        );
      }

      const student =
        studentSnapshot.data();

      if (
        student?.role !== "student"
      ) {
        throw new EnrollmentAdminError(
          "enrollment/invalid-student",
          "El usuario seleccionado no es estudiante.",
          409,
        );
      }

      if (
        student?.status !== "active"
      ) {
        throw new EnrollmentAdminError(
          "enrollment/inactive-student",
          "La cuenta del estudiante no está activa.",
          409,
        );
      }

      const previousEnrollment =
        enrollmentSnapshot.exists
          ? enrollmentSnapshot.data()
          : null;

      if (
        previousEnrollment?.status ===
        "active"
      ) {
        throw new EnrollmentAdminError(
          "enrollment/already-exists",
          "El estudiante ya está inscrito en esta asignatura.",
          409,
        );
      }

      const now = Date.now();

      const studentName =
        typeof student.name === "string"
          ? student.name
          : "Estudiante";

      const studentEmail =
        typeof student.email ===
        "string"
          ? student.email
          : "";

      const studentPhotoURL =
        typeof student.photoURL ===
        "string"
          ? student.photoURL
          : null;

      const enrollmentData: Record<
        string,
        unknown
      > = {
        id: enrollmentId,
        teacherId,
        studentId: input.studentId,
        studentName,
        studentEmail,
        studentPhotoURL,
        courseId: input.courseId,
        sectionId: input.sectionId,
        status: "active",
        updatedAt:
          FieldValue.serverTimestamp(),
      };

      if (!enrollmentSnapshot.exists) {
        enrollmentData.enrolledAt =
          FieldValue.serverTimestamp();
      }

      transaction.set(
        enrollmentReference,
        enrollmentData,
        {
          merge: true,
        },
      );

      transaction.update(
        courseReference,
        {
          studentsCount:
            FieldValue.increment(1),
          updatedAt:
            FieldValue.serverTimestamp(),
        },
      );

      return {
        id: enrollmentId,
        teacherId,
        studentId: input.studentId,
        studentName,
        studentEmail,
        studentPhotoURL,
        courseId: input.courseId,
        sectionId: input.sectionId,
        status: "active",
        enrolledAtMs:
          enrollmentSnapshot.exists
            ? safeTimestampMillis(
                previousEnrollment
                  ?.enrolledAt,
              )
            : now,
        updatedAtMs: now,
      };
    },
  );
}

export async function updateTeacherEnrollment(
  teacherId: string,
  input: UpdateTeacherEnrollmentInput,
): Promise<TeacherEnrollment> {
  const db = getAdminDb();

  const enrollmentReference = db
    .collection("enrollments")
    .doc(input.enrollmentId);

  return db.runTransaction(
    async (transaction) => {
      const enrollmentSnapshot =
        await transaction.get(
          enrollmentReference,
        );

      if (!enrollmentSnapshot.exists) {
        throw new EnrollmentAdminError(
          "enrollment/not-found",
          "La inscripción no existe.",
          404,
        );
      }

      const previousData =
        enrollmentSnapshot.data();

      const previousEnrollment =
        parseEnrollment(
          enrollmentSnapshot.id,
          previousData,
        );

      if (
        previousEnrollment.teacherId !==
        teacherId
      ) {
        throw new EnrollmentAdminError(
          "enrollment/forbidden",
          "No puedes modificar esta inscripción.",
          403,
        );
      }

      const courseReference = db
        .collection("courses")
        .doc(
          previousEnrollment.courseId,
        );

      const courseSnapshot =
        await transaction.get(
          courseReference,
        );

      if (
        !courseSnapshot.exists ||
        courseSnapshot.data()
          ?.teacherId !== teacherId
      ) {
        throw new EnrollmentAdminError(
          "enrollment/course-forbidden",
          "No puedes administrar esta asignatura.",
          403,
        );
      }

      const nextSectionId =
        input.sectionId ??
        previousEnrollment.sectionId;

      const nextStatus =
        input.status ??
        previousEnrollment.status;

      if (
        nextSectionId !==
          previousEnrollment.sectionId ||
        input.sectionId
      ) {
        const sectionReference = db
          .collection("sections")
          .doc(nextSectionId);

        const sectionSnapshot =
          await transaction.get(
            sectionReference,
          );

        if (!sectionSnapshot.exists) {
          throw new EnrollmentAdminError(
            "enrollment/section-not-found",
            "La sección seleccionada no existe.",
            404,
          );
        }

        const section =
          sectionSnapshot.data();

        if (
          section?.teacherId !==
            teacherId ||
          section?.courseId !==
            previousEnrollment.courseId
        ) {
          throw new EnrollmentAdminError(
            "enrollment/invalid-section",
            "La sección no pertenece a esta asignatura.",
            403,
          );
        }
      }

      const wasActive =
        previousEnrollment.status ===
        "active";

      const willBeActive =
        nextStatus === "active";

      transaction.update(
        enrollmentReference,
        {
          sectionId: nextSectionId,
          status: nextStatus,
          updatedAt:
            FieldValue.serverTimestamp(),
        },
      );

      if (
        !wasActive &&
        willBeActive
      ) {
        transaction.update(
          courseReference,
          {
            studentsCount:
              FieldValue.increment(1),
            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );
      }

      if (
        wasActive &&
        !willBeActive
      ) {
        transaction.update(
          courseReference,
          {
            studentsCount:
              FieldValue.increment(-1),
            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );
      }

      return {
        ...previousEnrollment,
        sectionId: nextSectionId,
        status: nextStatus,
        updatedAtMs: Date.now(),
      };
    },
  );
}