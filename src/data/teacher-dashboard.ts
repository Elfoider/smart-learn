export type TeacherMetricType =
  | "courses"
  | "students"
  | "pending"
  | "average";

export type TeacherCourseTone =
  | "teal"
  | "violet"
  | "amber"
  | "blue";

export interface TeacherMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend: string;
  type: TeacherMetricType;
}

export interface TeacherCourseSummary {
  id: string;
  code: string;
  title: string;
  section: string;
  period: string;
  schedule: string;
  students: number;
  average: number;
  attendance: number;
  pendingActivities: number;
  tone: TeacherCourseTone;
}

export interface TeacherUpcomingActivity {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  date: string;
  time: string;
  type:
    | "assessment"
    | "class"
    | "planning"
    | "grading";
  status:
    | "today"
    | "upcoming"
    | "pending";
}

export interface TeacherAcademicAlert {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
  tone:
    | "warning"
    | "danger"
    | "info";
}

export interface TeacherRecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "material"
    | "grade"
    | "student"
    | "planning";
}

export const teacherMetrics: TeacherMetric[] = [
  {
    id: "courses",
    label: "Asignaturas activas",
    value: "4",
    detail: "6 secciones asignadas",
    trend: "Período 2026-III",
    type: "courses",
  },
  {
    id: "students",
    label: "Estudiantes inscritos",
    value: "126",
    detail: "8 incorporaciones recientes",
    trend: "+6,8% este período",
    type: "students",
  },
  {
    id: "pending",
    label: "Actividades pendientes",
    value: "9",
    detail: "5 requieren calificación",
    trend: "3 vencen esta semana",
    type: "pending",
  },
  {
    id: "average",
    label: "Promedio general",
    value: "78,6%",
    detail: "Todas las asignaturas",
    trend: "+3,2% respecto al corte anterior",
    type: "average",
  },
];

export const teacherCourses: TeacherCourseSummary[] = [
  {
    id: "programacion-web",
    code: "PWA-402",
    title: "Programación Web Avanzada",
    section: "Sección A",
    period: "2026-III",
    schedule: "Lun. y mié. · 08:00",
    students: 32,
    average: 82,
    attendance: 91,
    pendingActivities: 2,
    tone: "teal",
  },
  {
    id: "base-datos",
    code: "BD-305",
    title: "Bases de Datos II",
    section: "Sección B",
    period: "2026-III",
    schedule: "Mar. y jue. · 10:00",
    students: 28,
    average: 76,
    attendance: 87,
    pendingActivities: 3,
    tone: "violet",
  },
  {
    id: "inteligencia-artificial",
    code: "IA-501",
    title: "Fundamentos de Inteligencia Artificial",
    section: "Sección A",
    period: "2026-III",
    schedule: "Vie. · 14:00",
    students: 35,
    average: 79,
    attendance: 89,
    pendingActivities: 1,
    tone: "amber",
  },
  {
    id: "ingenieria-software",
    code: "IS-410",
    title: "Ingeniería del Software",
    section: "Sección C",
    period: "2026-III",
    schedule: "Sáb. · 08:00",
    students: 31,
    average: 74,
    attendance: 84,
    pendingActivities: 3,
    tone: "blue",
  },
];

export const teacherUpcomingActivities: TeacherUpcomingActivity[] = [
  {
    id: "activity-1",
    title: "Revisar proyecto de componentes",
    courseCode: "PWA-402",
    courseTitle: "Programación Web Avanzada",
    date: "Hoy",
    time: "18:00",
    type: "grading",
    status: "today",
  },
  {
    id: "activity-2",
    title: "Clase: consultas y filtros NoSQL",
    courseCode: "BD-305",
    courseTitle: "Bases de Datos II",
    date: "Mañana",
    time: "10:00",
    type: "class",
    status: "upcoming",
  },
  {
    id: "activity-3",
    title: "Publicar evaluación de clasificación",
    courseCode: "IA-501",
    courseTitle: "Fundamentos de IA",
    date: "31 jul.",
    time: "14:00",
    type: "assessment",
    status: "upcoming",
  },
  {
    id: "activity-4",
    title: "Completar planificación de la unidad 3",
    courseCode: "IS-410",
    courseTitle: "Ingeniería del Software",
    date: "1 ago.",
    time: "23:59",
    type: "planning",
    status: "pending",
  },
];

export const teacherAcademicAlerts: TeacherAcademicAlert[] = [
  {
    id: "alert-1",
    title: "7 estudiantes requieren seguimiento",
    description:
      "Presentan promedio menor a 60% o dos actividades consecutivas sin entregar.",
    actionLabel: "Revisar estudiantes",
    href: "/teacher/students",
    tone: "danger",
  },
  {
    id: "alert-2",
    title: "Asistencia pendiente de registro",
    description:
      "La clase de Bases de Datos II del martes todavía no tiene asistencia.",
    actionLabel: "Registrar asistencia",
    href: "/teacher/attendance",
    tone: "warning",
  },
  {
    id: "alert-3",
    title: "Planificación lista para revisión",
    description:
      "El borrador generado para Programación Web puede ser editado y publicado.",
    actionLabel: "Abrir planificación",
    href: "/teacher/planning",
    tone: "info",
  },
];

export const teacherRecentActivity: TeacherRecentActivity[] = [
  {
    id: "recent-1",
    title: "Material publicado",
    description:
      "Guía de arquitectura modular · PWA-402",
    time: "Hace 24 min",
    type: "material",
  },
  {
    id: "recent-2",
    title: "Calificaciones actualizadas",
    description:
      "Evaluación de modelado documental · BD-305",
    time: "Hace 1 h",
    type: "grade",
  },
  {
    id: "recent-3",
    title: "Estudiante vinculado",
    description:
      "Nueva inscripción en Ingeniería del Software",
    time: "Hace 3 h",
    type: "student",
  },
  {
    id: "recent-4",
    title: "Planificación guardada",
    description:
      "Unidad 2: aprendizaje supervisado · IA-501",
    time: "Ayer",
    type: "planning",
  },
];