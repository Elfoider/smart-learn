import { z } from "zod";

export const practiceFormats = ["multiple-choice", "true-false"] as const;
export type PracticeFormat = (typeof practiceFormats)[number];

export const challengeSchema = z.object({
  format: z.enum(practiceFormats).default("multiple-choice"),
  question: z.string().trim().min(15).max(900),
  options: z.array(z.string().trim().min(1).max(180)).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(10).max(700),
  hint: z.string().trim().min(5).max(400).default("Revisa el objetivo de la clase y piensa qué concepto se aplica."),
  secondHint: z.string().trim().min(5).max(400).optional(),
}).superRefine((item, ctx) => {
  const options = item.options.map(normalizeQuestion);
  const valid = item.format === "true-false"
    ? options.length === 2 && options[0] === "verdadero" && options[1] === "falso"
    : options.length === 4 && new Set(options).size === 4;
  if (!valid) ctx.addIssue({ code: "custom", path: ["options"], message: "Alternativas inválidas para el formato" });
  if (item.correctIndex >= item.options.length) ctx.addIssue({ code: "custom", path: ["correctIndex"], message: "Respuesta fuera de rango" });
});
export function normalizeQuestion(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function parseChallenge(text: string, recent: string[], format: PracticeFormat = "multiple-choice") {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const item = challengeSchema.parse({ ...JSON.parse(cleaned), format });
  if (recent.some(question => normalizeQuestion(question) === normalizeQuestion(item.question))) throw new Error("practice/repeated-question");
  return item;
}
export function publicChallenge(id: string, item: z.infer<typeof challengeSchema> & { difficulty?: string; lessonId?: string; topic?: string; provider?: string; model?: string }) {
  return { challengeId: id, question: item.question, options: item.options, format: item.format, hint: item.hint, secondHint: item.secondHint,
    difficulty: item.difficulty, lessonId: item.lessonId, topic: item.topic, provider: item.provider, model: item.model };
}
