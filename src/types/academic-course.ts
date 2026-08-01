export type AcademicCourseStatus =
  | "active"
  | "draft"
  | "archived";

export type AcademicSectionStatus =
  | "active"
  | "inactive";

export type AcademicCourseTone =
  | "teal"
  | "violet"
  | "amber"
  | "blue";

export type AcademicModality =
  | "on-site"
  | "online"
  | "hybrid";

export type ScheduleDay =
  | "Lun"
  | "Mar"
  | "Mié"
  | "Jue"
  | "Vie"
  | "Sáb"
  | "Dom";

export interface AcademicCourse {
  id: string;
  teacherId: string;
  name: string;
  code: string;
  description: string;
  area: string;
  period: string;
  status: AcademicCourseStatus;
  tone: AcademicCourseTone;
  sectionsCount: number;
  studentsCount: number;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface AcademicSection {
  id: string;
  teacherId: string;
  courseId: string;
  code: string;
  scheduleDays: ScheduleDay[];
  startTime: string;
  endTime: string;
  classroom: string;
  modality: AcademicModality;
  capacity: number;
  status: AcademicSectionStatus;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface CourseFormValues {
  name: string;
  code: string;
  description: string;
  area: string;
  period: string;
  status: AcademicCourseStatus;
  tone: AcademicCourseTone;
}

export interface SectionFormValues {
  code: string;
  scheduleDays: ScheduleDay[];
  startTime: string;
  endTime: string;
  classroom: string;
  modality: AcademicModality;
  capacity: number;
  status: AcademicSectionStatus;
}

export interface CreateTeacherCourseInput {
  course: CourseFormValues;
  section: SectionFormValues;
}