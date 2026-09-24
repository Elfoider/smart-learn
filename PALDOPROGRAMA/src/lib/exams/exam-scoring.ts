import type {
  ExamAnswer,
  StudentExam,
} from "@/data/exams";
import type { ExamResult } from "@/types/exam-attempt";

export function examAnswersMatch(
  received: ExamAnswer | undefined,
  expected: ExamAnswer,
) {
  if (
    Array.isArray(received) &&
    Array.isArray(expected)
  ) {
    return (
      received.length === expected.length &&
      received.every(
        (value, index) =>
          value === expected[index],
      )
    );
  }

  return received === expected;
}

export function isExamQuestionAnswered(
  answer: ExamAnswer | undefined,
) {
  if (typeof answer === "string") {
    return answer.trim().length > 0;
  }

  return (
    Array.isArray(answer) &&
    answer.length > 0
  );
}

export function calculateExamResult(
  exam: StudentExam,
  answers: Record<string, ExamAnswer>,
): ExamResult {
  const totalPoints =
    exam.questions.reduce(
      (total, question) =>
        total + question.points,
      0,
    );

  let earnedPoints = 0;
  let correctAnswers = 0;
  let answeredQuestions = 0;

  exam.questions.forEach((question) => {
    const answer = answers[question.id];

    if (isExamQuestionAnswered(answer)) {
      answeredQuestions += 1;
    }

    if (
      examAnswersMatch(
        answer,
        question.correctAnswer,
      )
    ) {
      earnedPoints += question.points;
      correctAnswers += 1;
    }
  });

  const score =
    totalPoints > 0
      ? Math.round(
          (earnedPoints / totalPoints) *
            100,
        )
      : 0;

  return {
    score,
    earnedPoints,
    totalPoints,
    correctAnswers,
    answeredQuestions,
    passed: score >= exam.passingScore,
  };
}