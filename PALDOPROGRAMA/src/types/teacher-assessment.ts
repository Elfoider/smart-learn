export type TeacherAssessmentType =
  | "exam"
  | "quiz"
  | "workshop"
  | "project"
  | "presentation"
  | "practice"
  | "assignment";

export type TeacherAssessmentStatus =
  | "draft"
  | "scheduled"
  | "open"
  | "closed"
  | "graded"
  | "archived";

export type TeacherAssessmentDeliveryMode =
  | "online"
  | "manual";

export interface AssessmentRubricCriterion {
  id: string;
  title: string;
  description: string;
  points: number;
}

export interface TeacherAssessment {
  id: string;
  teacherId: string;
  courseId: string;
  sectionId: string | null;
  title: string;
  description: string;
  instructions: string;
  type: TeacherAssessmentType;
  deliveryMode: TeacherAssessmentDeliveryMode;
  weightPercentage: number;
  maxScore: number;
  passingScore: number;
  opensAt: string;
  closesAt: string;
  durationMinutes: number;
  attemptsAllowed: number;
  rubric: AssessmentRubricCriterion[];
  status: TeacherAssessmentStatus;
  visibleToStudents: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  publishedAtMs: number | null;
}

export interface TeacherAssessmentFormValues {
  courseId: string;
  sectionId: string | null;
  title: string;
  description: string;
  instructions: string;
  type: TeacherAssessmentType;
  deliveryMode: TeacherAssessmentDeliveryMode;
  weightPercentage: number;
  maxScore: number;
  passingScore: number;
  opensAt: string;
  closesAt: string;
  durationMinutes: number;
  attemptsAllowed: number;
  rubric: AssessmentRubricCriterion[];
  status: TeacherAssessmentStatus;
  visibleToStudents: boolean;
}