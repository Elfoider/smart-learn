export type ExamStatus =
  | "available"
  | "upcoming"
  | "completed";

export type ExamTone =
  | "teal"
  | "violet"
  | "amber";

export type ExamQuestionType =
  | "single-choice"
  | "true-false"
  | "visual-choice"
  | "ordering";

export type ExamAnswer =
  | string
  | string[];

export interface ExamOption {
  id: string;
  label: string;
  description?: string;
  symbol?: string;
}

export interface ExamQuestion {
  id: string;
  title: string;
  prompt: string;
  instruction: string;
  type: ExamQuestionType;
  points: number;
  options?: ExamOption[];
  orderingItems?: ExamOption[];
  correctAnswer: ExamAnswer;
  explanation: string;
}

export interface StudentExam {
  id: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  teacher: string;
  description: string;
  status: ExamStatus;
  tone: ExamTone;
  durationMinutes: number;
  attemptsAllowed: number;
  attemptsUsed: number;
  passingScore: number;
  availableLabel: string;
  weight: number;
  previousScore?: number;
  questions: ExamQuestion[];
}

const architectureQuestions: ExamQuestion[] = [
  {
    id: "question-1",
    title: "Estado de un componente",
    prompt:
      "¿Cuál de los siguientes datos debería administrarse como estado dentro de un componente interactivo?",
    instruction:
      "Selecciona la alternativa que representa información dinámica.",
    type: "single-choice",
    points: 20,
    options: [
      {
        id: "static-title",
        label: "Título institucional",
        description:
          "Texto permanente definido por la aplicación.",
        symbol: "T",
      },
      {
        id: "input-value",
        label: "Valor escrito en un formulario",
        description:
          "Información que cambia mientras el usuario interactúa.",
        symbol: "Aa",
      },
      {
        id: "css-color",
        label: "Color fijo de la marca",
        description:
          "Valor visual establecido en la hoja de estilos.",
        symbol: "#",
      },
      {
        id: "application-name",
        label: "Nombre de la plataforma",
        description:
          "Dato constante compartido por las pantallas.",
        symbol: "SL",
      },
    ],
    correctAnswer: "input-value",
    explanation:
      "El valor del formulario cambia durante la interacción y la interfaz debe actualizarse para representarlo.",
  },
  {
    id: "question-2",
    title: "Arquitectura cliente-servidor",
    prompt:
      "Selecciona el diagrama que representa correctamente el intercambio entre navegador, servidor y base de datos.",
    instruction:
      "Observa el sentido del flujo antes de seleccionar.",
    type: "visual-choice",
    points: 20,
    options: [
      {
        id: "client-server-database",
        label: "Cliente → Servidor → Base de datos",
        description:
          "El navegador solicita, el servidor procesa y la base de datos almacena.",
        symbol: "C → S → DB",
      },
      {
        id: "database-client-server",
        label: "Base de datos → Cliente → Servidor",
        description:
          "El navegador administra directamente toda la persistencia.",
        symbol: "DB → C → S",
      },
      {
        id: "client-database",
        label: "Cliente → Base de datos",
        description:
          "No existe una capa de validación del servidor.",
        symbol: "C → DB",
      },
    ],
    correctAnswer: "client-server-database",
    explanation:
      "En una arquitectura cliente-servidor, la interfaz realiza solicitudes al servidor y este controla el acceso a los datos.",
  },
  {
    id: "question-3",
    title: "Renderizado reactivo",
    prompt:
      "Cuando cambia el estado, React puede volver a representar las partes necesarias de la interfaz.",
    instruction:
      "Indica si la afirmación es verdadera o falsa.",
    type: "true-false",
    points: 15,
    options: [
      {
        id: "true",
        label: "Verdadero",
        description:
          "La interfaz puede reflejar el nuevo estado.",
        symbol: "✓",
      },
      {
        id: "false",
        label: "Falso",
        description:
          "La pantalla permanece siempre sin cambios.",
        symbol: "×",
      },
    ],
    correctAnswer: "true",
    explanation:
      "React actualiza la representación cuando cambia la información dinámica utilizada por un componente.",
  },
  {
    id: "question-4",
    title: "Flujo de una solicitud web",
    prompt:
      "Ordena correctamente las etapas de una solicitud realizada desde una aplicación web.",
    instruction:
      "Selecciona cada elemento en el orden en que debería ocurrir.",
    type: "ordering",
    points: 25,
    orderingItems: [
      {
        id: "server-processes",
        label: "El servidor procesa y valida",
        description:
          "Se ejecuta la lógica de la aplicación.",
        symbol: "2",
      },
      {
        id: "client-request",
        label: "El cliente envía la solicitud",
        description:
          "La interacción comienza en el navegador.",
        symbol: "1",
      },
      {
        id: "interface-updates",
        label: "La interfaz muestra el resultado",
        description:
          "El usuario recibe la respuesta visual.",
        symbol: "4",
      },
      {
        id: "server-responds",
        label: "El servidor devuelve una respuesta",
        description:
          "Los datos procesados regresan al cliente.",
        symbol: "3",
      },
    ],
    correctAnswer: [
      "client-request",
      "server-processes",
      "server-responds",
      "interface-updates",
    ],
    explanation:
      "El navegador inicia la solicitud, el servidor la procesa, devuelve una respuesta y finalmente la interfaz se actualiza.",
  },
  {
    id: "question-5",
    title: "Estructura documental",
    prompt:
      "¿Qué elemento de Firestore agrupa documentos relacionados, como usuarios, materias o evaluaciones?",
    instruction:
      "Selecciona la estructura principal correcta.",
    type: "single-choice",
    points: 20,
    options: [
      {
        id: "collection",
        label: "Colección",
        description:
          "Agrupación principal de documentos relacionados.",
        symbol: "▦",
      },
      {
        id: "formula",
        label: "Fórmula",
        description:
          "Expresión usada para realizar un cálculo.",
        symbol: "ƒ",
      },
      {
        id: "component",
        label: "Componente",
        description:
          "Pieza reutilizable de una interfaz.",
        symbol: "◇",
      },
      {
        id: "stylesheet",
        label: "Hoja de estilos",
        description:
          "Archivo utilizado para definir presentación visual.",
        symbol: "CSS",
      },
    ],
    correctAnswer: "collection",
    explanation:
      "Firestore organiza la información en colecciones que contienen documentos.",
  },
];

export const studentExams: StudentExam[] = [
  {
    id: "arquitectura-web-interactiva",
    title: "Evaluación interactiva de arquitectura web",
    courseId: "programacion-web",
    courseCode: "PWA-402",
    courseTitle: "Programación Web Avanzada",
    teacher: "Dra. Laura Mendoza",
    description:
      "Evaluación gráfica sobre componentes, estado, arquitectura cliente-servidor y estructuras documentales.",
    status: "available",
    tone: "teal",
    durationMinutes: 18,
    attemptsAllowed: 2,
    attemptsUsed: 0,
    passingScore: 60,
    availableLabel: "Disponible hasta el viernes",
    weight: 15,
    questions: architectureQuestions,
  },
  {
    id: "modelado-nosql",
    title: "Prueba de modelado documental NoSQL",
    courseId: "base-datos",
    courseCode: "BD-305",
    courseTitle: "Bases de Datos II",
    teacher: "Prof. Andrés Salazar",
    description:
      "Prueba sobre colecciones, documentos, relaciones y consultas.",
    status: "upcoming",
    tone: "violet",
    durationMinutes: 25,
    attemptsAllowed: 1,
    attemptsUsed: 0,
    passingScore: 60,
    availableLabel: "Se habilita el lunes",
    weight: 20,
    questions: [],
  },
  {
    id: "fundamentos-ia",
    title: "Conceptos fundamentales de inteligencia artificial",
    courseId: "inteligencia-artificial",
    courseCode: "IA-501",
    courseTitle: "Fundamentos de Inteligencia Artificial",
    teacher: "Ing. Mariana Torres",
    description:
      "Evaluación inicial sobre aprendizaje supervisado, clasificación y regresión.",
    status: "completed",
    tone: "amber",
    durationMinutes: 20,
    attemptsAllowed: 2,
    attemptsUsed: 1,
    passingScore: 60,
    previousScore: 84,
    availableLabel: "Completada",
    weight: 10,
    questions: [],
  },
];

export function getStudentExam(
  examId: string,
) {
  return studentExams.find(
    (exam) => exam.id === examId,
  );
}