export type EnrollmentStatus =
  | "active"
  | "inactive"
  | "completed";

export type StudentAccountStatus =
  | "active"
  | "inactive"
  | "suspended";

export interface StudentDirectoryItem {
  id: string;
  name: string;
  email: string;
  status: StudentAccountStatus;
  photoURL: string | null;
}

export interface TeacherEnrollment {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhotoURL: string | null;
  courseId: string;
  sectionId: string;
  status: EnrollmentStatus;
  enrolledAtMs: number;
  updatedAtMs: number;
}

export interface CreateTeacherEnrollmentInput {
  studentId: string;
  courseId: string;
  sectionId: string;
}

export interface UpdateTeacherEnrollmentInput {
  enrollmentId: string;
  sectionId?: string;
  status?: EnrollmentStatus;
}

export interface TeacherEnrollmentListResponse {
  enrollments: TeacherEnrollment[];
}

export interface StudentSearchResponse {
  students: StudentDirectoryItem[];
}

export interface TeacherEnrollmentResponse {
  enrollment: TeacherEnrollment;
}