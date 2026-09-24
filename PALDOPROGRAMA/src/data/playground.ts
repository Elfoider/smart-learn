export type PlaygroundExerciseType =
  | "multiple-choice"
  | "true-false"
  | "short-answer";

export type PlaygroundDifficulty =
  | "Básico"
  | "Intermedio"
  | "Avanzado";

export interface PlaygroundExercise {
  id: string;
  title: string;
  prompt: string;
  type: PlaygroundExerciseType;
  difficulty: PlaygroundDifficulty;
  correctAnswer: string;
  acceptedAnswers?: string[];
  options?: string[];
  hints: string[];
  explanation: string;
}

export interface PlaygroundTopic {
  id: string;
  title: string;
  description: string;
  exercises: PlaygroundExercise[];
}

export interface PlaygroundCourse {
  id: string;
  code: string;
  title: string;
  description: string;
  tone: "teal" | "violet" | "amber";
  topics: PlaygroundTopic[];
}

export const playgroundCourses: PlaygroundCourse[] = [
  {
    id: "programacion-web",
    code: "PWA-402",
    title: "Programación Web Avanzada",
    description:
      "Practica componentes, estado, eventos y diseño de interfaces.",
    tone: "teal",
    topics: [
      {
        id: "estado-reactivo",
        title: "Estado e interacción",
        description:
          "Comprueba cómo reaccionan los componentes ante los cambios de información.",
        exercises: [
          {
            id: "estado-1",
            title: "Identificar el estado",
            prompt:
              "En un formulario, ¿cuál de los siguientes valores debería manejarse como estado del componente?",
            type: "multiple-choice",
            difficulty: "Básico",
            correctAnswer:
              "El texto que el usuario está escribiendo",
            options: [
              "El nombre fijo de la plataforma",
              "El texto que el usuario está escribiendo",
              "El color definido permanentemente en CSS",
              "El título estático de la página",
            ],
            hints: [
              "Busca un valor que pueda cambiar durante la interacción.",
              "El usuario modifica ese valor directamente.",
            ],
            explanation:
              "El texto introducido por el usuario cambia durante la interacción y afecta lo que muestra el componente, por lo que debe administrarse como estado.",
          },
          {
            id: "estado-2",
            title: "Actualización de interfaz",
            prompt:
              "Cuando cambia el estado de un componente, React puede volver a representar la interfaz para mostrar el nuevo valor.",
            type: "true-false",
            difficulty: "Básico",
            correctAnswer: "Verdadero",
            options: [
              "Verdadero",
              "Falso",
            ],
            hints: [
              "Piensa en una pantalla cuyo contador aumenta.",
              "El nuevo valor debe reflejarse visualmente.",
            ],
            explanation:
              "El estado controla información dinámica. Al actualizarse, React vuelve a representar las partes necesarias de la interfaz.",
          },
          {
            id: "estado-3",
            title: "Concepto central",
            prompt:
              "Escribe una palabra que represente la información interna que puede cambiar dentro de un componente.",
            type: "short-answer",
            difficulty: "Intermedio",
            correctAnswer: "estado",
            acceptedAnswers: [
              "estado",
              "state",
              "el estado",
            ],
            hints: [
              "Es uno de los conceptos principales de React.",
              "En inglés se conoce como state.",
            ],
            explanation:
              "El estado es la información interna que puede cambiar y provocar una actualización visual del componente.",
          },
        ],
      },
    ],
  },
  {
    id: "base-datos",
    code: "BD-305",
    title: "Bases de Datos II",
    description:
      "Refuerza colecciones, documentos, consultas y seguridad de datos.",
    tone: "violet",
    topics: [
      {
        id: "modelado-nosql",
        title: "Modelado documental NoSQL",
        description:
          "Practica la organización de información mediante colecciones y documentos.",
        exercises: [
          {
            id: "nosql-1",
            title: "Colecciones y documentos",
            prompt:
              "En una base de datos documental, ¿qué elemento agrupa documentos relacionados?",
            type: "multiple-choice",
            difficulty: "Básico",
            correctAnswer: "Una colección",
            options: [
              "Una colección",
              "Una celda",
              "Una fórmula",
              "Una diapositiva",
            ],
            hints: [
              "Es equivalente a una agrupación principal.",
              "En Firestore puede contener muchos documentos.",
            ],
            explanation:
              "Una colección agrupa documentos relacionados, por ejemplo usuarios, asignaturas o evaluaciones.",
          },
          {
            id: "nosql-2",
            title: "Estructura flexible",
            prompt:
              "Todos los documentos de una colección NoSQL están obligados a tener exactamente los mismos campos.",
            type: "true-false",
            difficulty: "Intermedio",
            correctAnswer: "Falso",
            options: [
              "Verdadero",
              "Falso",
            ],
            hints: [
              "Los modelos documentales se caracterizan por su flexibilidad.",
              "Dos documentos relacionados pueden contener campos diferentes.",
            ],
            explanation:
              "Las bases documentales permiten estructuras flexibles, aunque conviene mantener consistencia cuando la aplicación lo requiere.",
          },
          {
            id: "nosql-3",
            title: "Unidad de información",
            prompt:
              "¿Cómo se llama la unidad que almacena campos y valores dentro de una colección de Firestore?",
            type: "short-answer",
            difficulty: "Básico",
            correctAnswer: "documento",
            acceptedAnswers: [
              "documento",
              "un documento",
              "document",
            ],
            hints: [
              "Está dentro de una colección.",
              "En inglés se denomina document.",
            ],
            explanation:
              "El documento es la unidad que contiene campos y valores dentro de una colección.",
          },
        ],
      },
    ],
  },
  {
    id: "inteligencia-artificial",
    code: "IA-501",
    title: "Fundamentos de Inteligencia Artificial",
    description:
      "Practica conceptos de datos, entrenamiento, clasificación y regresión.",
    tone: "amber",
    topics: [
      {
        id: "aprendizaje-supervisado",
        title: "Aprendizaje supervisado",
        description:
          "Diferencia datos de entrenamiento, etiquetas y tipos de predicción.",
        exercises: [
          {
            id: "ia-1",
            title: "Datos etiquetados",
            prompt:
              "¿Qué necesita normalmente un modelo de aprendizaje supervisado durante su entrenamiento?",
            type: "multiple-choice",
            difficulty: "Básico",
            correctAnswer:
              "Ejemplos con respuestas conocidas",
            options: [
              "Ejemplos con respuestas conocidas",
              "Únicamente colores aleatorios",
              "Una interfaz sin datos",
              "Documentos completamente vacíos",
            ],
            hints: [
              "El modelo necesita comparar sus predicciones.",
              "Las respuestas conocidas también se denominan etiquetas.",
            ],
            explanation:
              "El aprendizaje supervisado utiliza ejemplos con respuestas conocidas para aprender la relación entre entradas y resultados.",
          },
          {
            id: "ia-2",
            title: "Clasificación",
            prompt:
              "Predecir si un estudiante aprobará o reprobará es un problema de clasificación.",
            type: "true-false",
            difficulty: "Intermedio",
            correctAnswer: "Verdadero",
            options: [
              "Verdadero",
              "Falso",
            ],
            hints: [
              "El resultado pertenece a una de dos categorías.",
              "Aprobar y reprobar son etiquetas, no cantidades continuas.",
            ],
            explanation:
              "Es clasificación porque el resultado esperado pertenece a categorías definidas: aprobar o reprobar.",
          },
          {
            id: "ia-3",
            title: "Predicción numérica",
            prompt:
              "¿Qué tipo de aprendizaje se utiliza para predecir un valor numérico continuo, como una calificación estimada?",
            type: "short-answer",
            difficulty: "Intermedio",
            correctAnswer: "regresión",
            acceptedAnswers: [
              "regresión",
              "regresion",
              "regression",
            ],
            hints: [
              "No predice una categoría.",
              "Su resultado suele ser un número continuo.",
            ],
            explanation:
              "La regresión se utiliza para estimar valores numéricos continuos, como precios, temperaturas o calificaciones.",
          },
        ],
      },
    ],
  },
];

export function getPlaygroundCourse(
  courseId: string,
) {
  return playgroundCourses.find(
    (course) => course.id === courseId,
  );
}

export function normalizePlaygroundAnswer(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(/\s+/g, " ");
}

export function evaluatePlaygroundAnswer(
  exercise: PlaygroundExercise,
  answer: string,
) {
  const normalizedAnswer =
    normalizePlaygroundAnswer(answer);

  const acceptedAnswers = [
    exercise.correctAnswer,
    ...(exercise.acceptedAnswers ?? []),
  ].map(normalizePlaygroundAnswer);

  return acceptedAnswers.includes(
    normalizedAnswer,
  );
}