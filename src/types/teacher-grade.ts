export type TeacherGradeStatus =
  | "draft"
  | "published";

export interface TeacherGrade {
  id: string;
  teacherId: string;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  sectionId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  weightPercentage: number;
  normalizedPercentage: number;
  weightedPoints: number;
  feedback: string;
  status: TeacherGradeStatus;
  gradedAtMs: number;
  publishedAtMs: number | null;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface SaveTeacherGradeInput {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  sectionId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxScore: number;
  weightPercentage: number;
  feedback: string;
  status: TeacherGradeStatus;
  isNew: boolean;
}