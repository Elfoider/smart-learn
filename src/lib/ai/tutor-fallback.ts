import type {
  TutorAction,
  TutorRequestPayload,
} from "@/types/tutor";

function escapeRegExp(
  value: string,
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function hideCorrectAnswer(
  text: string,
  correctAnswer: string,
) {
  if (!correctAnswer.trim()) {
    return text;
  }

  const expression = new RegExp(
    escapeRegExp(correctAnswer.trim()),
    "gi",
  );

  return text.replace(
    expression,
    "el concepto principal",
  );
}

function getActionIntroduction(
  action: TutorAction,
) {
  const introductions: Record<
    TutorAction,
    string
  > = {
    explain:
      "Vamos a comprender el concepto antes de intentar responder.",
    hint:
      "Te daré una orientación sin revelar directamente la solución.",
    example:
      "Veamos una situación parecida para relacionar el concepto.",
    question:
      "Analicemos tu pregunta utilizando únicamente el contenido del ejercicio.",
  };

  return introductions[action];
}

function createExample(
  payload: TutorRequestPayload,
) {
  if (
    payload.courseId ===
    "programacion-web"
  ) {
    return [
      "Imagina un botón que muestra cuántas veces fue presionado.",
      "El valor cambia con cada interacción y la interfaz debe reflejarlo.",
      "Identifica qué información permanece fija y cuál cambia.",
    ].join(" ");
  }

  if (
    payload.courseId ===
    "base-datos"
  ) {
    return [
      "Imagina una biblioteca digital.",
      "Los libros relacionados se agrupan en una misma sección y cada libro conserva sus propios datos.",
      "Relaciona esa estructura con el concepto solicitado.",
    ].join(" ");
  }

  if (
    payload.courseId ===
    "inteligencia-artificial"
  ) {
    return [
      "Imagina un sistema que analiza ejemplos anteriores para estimar el resultado de un caso nuevo.",
      "Primero identifica si el resultado esperado es una categoría o un valor numérico.",
    ].join(" ");
  }

  return [
    "Crea un caso sencillo con datos de entrada, un proceso y un resultado.",
    "Después relaciona cada elemento con el concepto de la pregunta.",
  ].join(" ");
}

export function generateTutorFallback(
  payload: TutorRequestPayload,
) {
  const firstHint =
    payload.exercise.hints[0] ??
    "Identifica primero el concepto central del enunciado.";

  const safeExplanation =
    hideCorrectAnswer(
      payload.exercise.explanation,
      payload.exercise.correctAnswer,
    );

  const introduction =
    getActionIntroduction(
      payload.action,
    );

  if (payload.action === "hint") {
    return [
      introduction,
      "",
      `Pista: ${firstHint}`,
      "",
      "¿Qué elemento del enunciado cambia, agrupa información o representa el resultado esperado?",
    ].join("\n");
  }

  if (payload.action === "example") {
    return [
      introduction,
      "",
      createExample(payload),
      "",
      "Ahora compara ese ejemplo con el ejercicio actual. ¿Qué característica tienen en común?",
    ].join("\n");
  }

  if (payload.action === "question") {
    const studentMessage =
      payload.message.trim();

    return [
      introduction,
      "",
      studentMessage
        ? `Tu duda se relaciona con: “${studentMessage}”.`
        : "Primero identifica la parte exacta del ejercicio que genera la duda.",
      "",
      safeExplanation,
      "",
      `También puedes comenzar con esta pista: ${firstHint}`,
    ].join("\n");
  }

  return [
    introduction,
    "",
    safeExplanation,
    "",
    `Pista inicial: ${firstHint}`,
    "",
    "Intenta explicar con tus propias palabras qué concepto está evaluando la pregunta.",
  ].join("\n");
}