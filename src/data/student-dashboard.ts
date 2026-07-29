export type CourseTone =
  | "teal"
  | "violet"
  | "amber";

export interface StudentCourse {
  id: string;
  code: string;
  title: string;
  teacher: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
  duration: string;
  tone: CourseTone;
}

export interface StudentActivity {
  id: string;
  title: string;
  course: string;
  type: "assignment" | "practice" | "exam";
  dueLabel: string;
  urgent: boolean;
  href: string;
}

export interface UpcomingClass {
  id: string;
  course: string;
  title: string;
  teacher: string;
  day: string;
  time: string;
  type: "live" | "recorded";
}

export const studentCourses: StudentCourse[] = [
  {
    id: "programacion-web",
    code: "PWA-402",
    title: "Programación Web Avanzada",
    teacher: "Dra. Laura Mendoza",
    progress: 72,
    completedLessons: 13,
    totalLessons: 18,
    nextLesson: "Componentes reactivos y estado",
    duration: "24 min",
    tone: "teal",
  },
  {
    id: "base-datos",
    code: "BD-305",
    title: "Bases de Datos II",
    teacher: "Prof. Andrés Salazar",
    progress: 46,
    completedLessons: 7,
    totalLessons: 15,
    nextLesson: "Modelado de documentos NoSQL",
    duration: "31 min",
    tone: "violet",
  },
  {
    id: "inteligencia-artificial",
    code: "IA-501",
    title: "Fundamentos de Inteligencia Artificial",
    teacher: "Ing. Mariana Torres",
    progress: 28,
    completedLessons: 4,
    totalLessons: 14,
    nextLesson: "Aprendizaje supervisado",
    duration: "19 min",
    tone: "amber",
  },
];

export const studentActivities: StudentActivity[] = [
  {
    id: "activity-1",
    title: "Diseñar una interfaz responsive",
    course: "Programación Web Avanzada",
    type: "assignment",
    dueLabel: "Entrega mañana",
    urgent: true,
    href: "/student/courses",
  },
  {
    id: "activity-2",
    title: "Práctica sobre colecciones NoSQL",
    course: "Bases de Datos II",
    type: "practice",
    dueLabel: "Disponible hasta el viernes",
    urgent: false,
    href: "/student/playground",
  },
  {
    id: "activity-3",
    title: "Evaluación de conceptos fundamentales",
    course: "Inteligencia Artificial",
    type: "exam",
    dueLabel: "En 4 días",
    urgent: false,
    href: "/student/courses",
  },
];

export const upcomingClasses: UpcomingClass[] = [
  {
    id: "class-1",
    course: "Programación Web Avanzada",
    title: "Arquitectura de componentes",
    teacher: "Dra. Laura Mendoza",
    day: "Hoy",
    time: "15:00",
    type: "live",
  },
  {
    id: "class-2",
    course: "Bases de Datos II",
    title: "Consultas y estructuras NoSQL",
    teacher: "Prof. Andrés Salazar",
    day: "Mañana",
    time: "10:30",
    type: "live",
  },
  {
    id: "class-3",
    course: "Inteligencia Artificial",
    title: "Introducción a modelos predictivos",
    teacher: "Ing. Mariana Torres",
    day: "Viernes",
    time: "08:00",
    type: "recorded",
  },
];