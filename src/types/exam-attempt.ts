import type { ExamAnswer } from "@/data/exams";

export type ExamAttemptStatus =
  | "active"
  | "submitted";

export type ExamSubmissionReason =
  | "manual"
  | "time-expired";

export type ExamProgressStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export interface ExamResult {
  score: number;
  earnedPoints: number;
  totalPoints: number;
  correctAnswers: number;
  answeredQuestions: number;
  passed: boolean;
}

export interface ExamAttemptRecord {
  attemptId: string;
  userId: string;
  examId: string;
  courseId: string;
  status: ExamAttemptStatus;
  attemptNumber: number;
  currentQuestionIndex: number;
  answers: Record<string, ExamAnswer>;
  flaggedQuestionIds: string[];
  durationSeconds: number;
  remainingSeconds: number;
  startedAtMs: number;
  result: ExamResult | null;
  submissionReason: ExamSubmissionReason | null;
}

export interface ExamProgressRecord {
  examId: string;
  attemptsUsed: number;
  activeAttemptId: string | null;
  lastAttemptId: string | null;
  lastScore: number | null;
  bestScore: number | null;
  status: ExamProgressStatus;
}

export interface StartExamResponse {
  attempt: ExamAttemptRecord;
  progress: ExamProgressRecord;
}

export interface SubmitExamResponse {
  attempt: ExamAttemptRecord;
  progress: ExamProgressRecord;
}