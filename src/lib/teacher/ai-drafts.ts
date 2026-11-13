import { z } from "zod";

export const teacherDraftTasks = ["plan", "syllabus", "activity", "rubric", "guide", "quiz"] as const;
export type TeacherDraftTask = (typeof teacherDraftTasks)[number];

export const teacherDraftTemplates: Record<TeacherDraftTask, { label: string; hint: string; instructions: string }> = {
  plan: {
    label: "Planificación de clase",
    hint: "Indica el tema, la duración y el nivel del grupo.",
    instructions: "Incluye título, unidad, objetivos, contenidos, explicación para estudiantes, estrategias, actividades, recursos y evidencia de aprendizaje.",
  },
  syllabus: {
    label: "Temario por unidades",
    hint: "Indica el nombre de la materia y, si aplica, el número de unidades.",
    instructions: "Propón un temario progresivo con 4 unidades por defecto. Numera las unidades e incluye en cada una un objetivo, hasta 3 temas y una actividad breve. Si el usuario solicita muchas unidades, haz una primera parte e indica cuáles cubriste.",
  },
  activity: {
    label: "Actividad de aprendizaje",
    hint: "Describe qué quieres que el estudiante practique o produzca.",
    instructions: "Incluye propósito, duración orientativa, instrucciones numeradas, entregable, criterios de revisión y una variante para reforzar el aprendizaje.",
  },
  rubric: {
    label: "Rúbrica de evaluación",
    hint: "Indica el trabajo que se evaluará y su puntaje máximo.",
    instructions: "Incluye criterios observables, tres niveles con descriptores claros y puntajes cuya suma coincida con el máximo solicitado. Si falta el máximo, propone 20 puntos.",
  },
  guide: {
    label: "Guía de estudio",
    hint: "Indica qué debe comprender el estudiante al terminar la lectura.",
    instructions: "Incluye un resumen, conceptos clave, un ejemplo explicado y tres preguntas de repaso.",
  },
  quiz: {
    label: "Banco de preguntas",
    hint: "Indica el tema y la dificultad deseada.",
    instructions: "Genera hasta 5 preguntas de opción múltiple con cuatro alternativas cada una. Separa la clave y las explicaciones al final bajo el encabezado «Uso docente».",
  },
};

const shortList = z.array(z.string().trim().min(1).max(240)).min(1).max(5);

export const generatedLessonSchema = z.object({
  title: z.string().trim().min(4).max(180),
  unit: z.string().trim().min(2).max(140),
  objectives: shortList,
  contents: shortList,
  lessonContent: z.string().trim().min(20).max(2500),
  activities: shortList,
});

export type GeneratedLesson = z.infer<typeof generatedLessonSchema>;

export function parseGeneratedLesson(text: string) {
  const json = text.trim().replace(/^\x60\x60\x60(?:json)?\s*/i, "").replace(/\s*\x60\x60\x60$/, "");
  try {
    const parsed = generatedLessonSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function lessonDraftText(lesson: GeneratedLesson) {
  return [
    lesson.title,
    "Unidad · " + lesson.unit,
    "Objetivos\n" + lesson.objectives.map(value => "• " + value).join("\n"),
    "Contenidos\n" + lesson.contents.map(value => "• " + value).join("\n"),
    "Explicación\n" + lesson.lessonContent,
    "Actividades\n" + lesson.activities.map(value => "• " + value).join("\n"),
  ].join("\n\n");
}

const topicStopWords = new Set([
  "acerca", "analisis", "clase", "como", "cuando", "durante", "epoca", "estudio",
  "explica", "explicar", "genera", "historia", "introduccion", "planificacion",
  "para", "sobre", "tema", "temas", "tiene", "unidad",
]);

function topicWords(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

export function draftMatchesTopic(topic: string, content: string) {
  const keys = [...new Set(topicWords(topic).filter(word => word.length >= 4 && !topicStopWords.has(word)))];
  if (!keys.length) return true;
  const words = new Set(topicWords(content));
  const matching = keys.filter(key => words.has(key) || words.has(key + "s") || (key.endsWith("s") && words.has(key.slice(0, -1))));
  return matching.length >= Math.ceil(keys.length * 0.6);
}
