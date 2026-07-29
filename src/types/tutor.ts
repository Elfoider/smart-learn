export type TutorAction =
  | "explain"
  | "hint"
  | "example"
  | "question";

export type TutorProvider =
  | "gemini"
  | "fallback";

export interface TutorHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorExerciseContext {
  id: string;
  title: string;
  prompt: string;
  type:
    | "multiple-choice"
    | "true-false"
    | "short-answer";
  difficulty: string;
  correctAnswer: string;
  hints: string[];
  explanation: string;
}

export interface TutorRequestPayload {
  action: TutorAction;
  message: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  exercise: TutorExerciseContext;
  history: TutorHistoryMessage[];
}

export interface TutorResponsePayload {
  message: string;
  provider: TutorProvider;
  model: string;
  remaining: number;
  requestId: string;
  fallbackReason?: string;
}