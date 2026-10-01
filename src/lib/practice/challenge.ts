import { z } from "zod";

export const challengeSchema = z.object({
  question: z.string().trim().min(15).max(900),
  options: z.array(z.string().trim().min(1).max(180)).length(4)
    .refine(options => new Set(options.map(normalizeQuestion)).size === 4, "Las alternativas deben ser distintas"),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(10).max(700),
  hint: z.string().trim().min(5).max(400).default("Revisa el objetivo de la clase y descarta las alternativas que lo contradicen."),
});
export function normalizeQuestion(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function parseChallenge(text: string, recent: string[]) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const item = challengeSchema.parse(JSON.parse(cleaned));
  if (recent.some(question => normalizeQuestion(question) === normalizeQuestion(item.question))) throw new Error("practice/repeated-question");
  return item;
}
export function publicChallenge(id: string, item: z.infer<typeof challengeSchema> & { difficulty?: string; lessonId?: string; topic?: string; provider?: string; model?: string }) {
  return { challengeId: id, question: item.question, options: item.options, hint: item.hint,
    difficulty: item.difficulty, lessonId: item.lessonId, topic: item.topic, provider: item.provider, model: item.model };
}
