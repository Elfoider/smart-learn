export type LessonPlanStatus =
  | "draft"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "archived";

export interface TeacherLessonPlan {
  id: string;
  teacherId: string;
  courseId: string;
  sectionId: string | null;
  title: string;
  unit: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  estimatedMinutes: number;
  objectives: string[];
  contents: string[];
  strategies: string[];
  resources: string[];
  activities: string[];
  evaluationEvidence: string;
  notes: string;
  status: LessonPlanStatus;
  visibleToStudents: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  publishedAtMs: number | null;
}

export interface LessonPlanFormValues {
  courseId: string;
  sectionId: string | null;
  title: string;
  unit: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  estimatedMinutes: number;
  objectives: string[];
  contents: string[];
  strategies: string[];
  resources: string[];
  activities: string[];
  evaluationEvidence: string;
  notes: string;
  status: LessonPlanStatus;
  visibleToStudents: boolean;
}