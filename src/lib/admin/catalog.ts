import { z } from "zod";
import { documentId } from "@/lib/server/request-validation";
const text = z.string().trim().max(2000).default("");
const title = z.string().trim().min(2).max(180);
const num = (max = 10000) => z.number().finite().min(0).max(max);
const date = z.string().max(40).refine(v => !v || Number.isFinite(Date.parse(v)), "Fecha inválida.").default("");
const lines = z.array(z.string().trim().max(1000)).max(30).transform(v => v.filter(Boolean)).default([]);
const sectionId = documentId.nullable().default(null);
const academic = { courseId: documentId, sectionId };
const visibility = { visibleToStudents: z.boolean().default(false) };
const link = z.string().trim().min(1).max(2000).refine(v => /^https?:\/\//i.test(v) || /^\/demo-materials\/[\w-]+\.html$/.test(v), "Usa un enlace HTTP/HTTPS válido.").refine(v => { try {
    return v.startsWith("/demo-materials/") || ["http:", "https:"].includes(new URL(v).protocol);
}
catch {
    return false;
} });
export const adminSchemas = {
    users: z.object({ name: title, role: z.enum(["admin", "teacher", "student"]), status: z.enum(["active", "inactive", "suspended"]) }).strict(),
    courses: z.object({ teacherId: documentId, name: title, code: title, description: text, area: text, period: title, status: z.enum(["draft", "active", "archived"]), tone: z.enum(["teal", "blue", "violet", "amber"]).default("teal") }).strict(),
    sections: z.object({ courseId: documentId, code: title, scheduleDays: z.array(z.enum(["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"])).max(7).default([]), startTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/).default(""), endTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/).default(""), classroom: text, modality: z.enum(["on-site", "online", "hybrid"]), capacity: num(1000).int().min(1), status: z.enum(["active", "inactive"]) }).strict(),
    enrollments: z.object({ courseId: documentId, studentId: documentId, sectionId: documentId, status: z.enum(["active", "inactive", "completed"]) }).strict(),
    lessonPlans: z.object({ ...academic, title, unit: text, weekLabel: text, startDate: date, endDate: date, estimatedMinutes: num(1440).int().default(60), objectives: lines, contents: lines, strategies: lines, resources: lines, activities: lines, evaluationEvidence: text, notes: text, lessonContent: z.string().max(30000).default(""), status: z.enum(["draft", "scheduled", "in-progress", "completed", "archived"]), ...visibility }).strict(),
    assessments: z.object({ ...academic, title, description: text, instructions: z.string().max(12000).default(""), type: z.enum(["exam", "quiz", "workshop", "project", "presentation", "practice", "assignment"]), deliveryMode: z.enum(["online", "manual"]), weightPercentage: num(100), maxScore: num().positive(), passingScore: num(), opensAt: date, closesAt: date, durationMinutes: num(1440).int().default(60), attemptsAllowed: num(20).int().min(1).default(1), rubric: z.array(z.object({ id: documentId, title, description: text, points: num() }).strict()).max(20).default([]), status: z.enum(["draft", "scheduled", "open", "closed", "graded", "archived"]), ...visibility }).strict(),
    materials: z.object({ ...academic, title, url: link, unit: text, kind: z.enum(["link", "pdf", "video", "guide"]).default("link"), ...visibility }).strict(),
    onlineClasses: z.object({ ...academic, title, url: link, startsAt: date.nullable(), unit: text, kind: z.enum(["live", "recording"]).default("live"), ...visibility }).strict(),
    grades: z.object({ courseId: documentId, studentId: documentId, assessmentId: documentId, score: num(), feedback: text, status: z.enum(["draft", "published"]) }).strict(),
    attendance: z.object({ courseId: documentId, studentId: documentId, date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v + "T12:00:00Z")) && new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v, "Fecha inválida."), status: z.enum(["present", "absent", "late", "excused"]) }).strict(),
    settings: z.object({ institutionName: title, academicPeriod: title, supportEmail: z.union([z.literal(""), z.email()]).default(""), announcement: z.string().max(1000).default(""), dailyAiLimit: num(200).int().min(1) }).strict(),
};
export type AdminResource = keyof typeof adminSchemas;
export type AdminRecord = Record<string, unknown> & {
    id: string;
};
export type AdminField = {
    key: string;
    label: string;
    type?: "text" | "textarea" | "number" | "select" | "boolean" | "lines" | "date" | "datetime-local" | "time" | "rubric";
    options?: string[];
    reference?: "users" | "courses" | "sections" | "assessments";
    role?: string;
    default?: unknown;
    required?: boolean;
};
const f = (key: string, label: string, options: Partial<AdminField> = {}): AdminField => ({ key, label, ...options });
const choices = (key: string, label: string, options: string[]) => f(key, label, { type: "select", options, default: options[0] });
const course = f("courseId", "Materia", { reference: "courses", required: true });
const section = f("sectionId", "Sección (vacío: todas)", { reference: "sections", default: null });
const titleField = f("title", "Título", { required: true });
const visible = f("visibleToStudents", "Visible para estudiantes", { type: "boolean", default: false });
export const adminModules: Record<AdminResource, {
    label: string;
    description: string;
    fields: AdminField[];
}> = {
    users: { label: "Usuarios", description: "Gestiona perfiles y acceso a Smart Learn. El correo se vincula con Firebase Authentication.", fields: [f("name", "Nombre", { required: true }), choices("role", "Rol", ["student", "teacher", "admin"]), choices("status", "Estado", ["active", "inactive", "suspended"])] },
    courses: { label: "Materias", description: "Organiza la oferta académica, períodos y docentes responsables.", fields: [f("name", "Nombre", { required: true }), f("code", "Código", { required: true }), f("teacherId", "Docente responsable", { reference: "users", role: "teacher", required: true }), f("description", "Descripción", { type: "textarea" }), f("area", "Área"), f("period", "Período", { required: true }), choices("status", "Estado", ["draft", "active", "archived"]), choices("tone", "Color", ["teal", "blue", "violet", "amber"])] },
    sections: { label: "Secciones", description: "Gestiona horarios, modalidad y capacidad por materia.", fields: [course, f("code", "Código", { required: true }), f("scheduleDays", "Días (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)", { type: "lines", default: [] }), f("startTime", "Hora inicial", { type: "time" }), f("endTime", "Hora final", { type: "time" }), f("classroom", "Aula"), choices("modality", "Modalidad", ["on-site", "online", "hybrid"]), f("capacity", "Capacidad", { type: "number", default: 30 }), choices("status", "Estado", ["active", "inactive"])] },
    enrollments: { label: "Matrículas", description: "Vincula estudiantes, cambia estados y controla la capacidad de las secciones.", fields: [course, f("sectionId", "Sección", { reference: "sections", required: true }), f("studentId", "Estudiante", { reference: "users", role: "student", required: true }), choices("status", "Estado", ["active", "inactive", "completed"])] },
    lessonPlans: { label: "Clases y planificación", description: "Edita el contenido del aula y controla su publicación. Las observaciones no deben contener datos personales.", fields: [course, section, titleField, f("unit", "Unidad"), f("weekLabel", "Semana"), f("startDate", "Inicio", { type: "date" }), f("endDate", "Fin", { type: "date" }), f("estimatedMinutes", "Minutos", { type: "number", default: 60 }), ...[["objectives", "Objetivos"], ["contents", "Contenidos"], ["strategies", "Estrategias"], ["resources", "Recursos"], ["activities", "Actividades"]].map(([key, label]) => f(key, label, { type: "lines", default: [] })), f("lessonContent", "Contenido de la clase", { type: "textarea" }), f("evaluationEvidence", "Evidencia de evaluación"), f("notes", "Observaciones (sin datos personales)", { type: "textarea" }), choices("status", "Estado", ["draft", "scheduled", "in-progress", "completed", "archived"]), visible] },
    assessments: { label: "Evaluaciones y rúbricas", description: "Publica evaluaciones y criterios. Las entregas manuales se coordinan con el docente.", fields: [course, section, titleField, f("description", "Descripción", { type: "textarea" }), f("instructions", "Instrucciones", { type: "textarea" }), choices("type", "Tipo", ["assignment", "exam", "quiz", "workshop", "project", "presentation", "practice"]), choices("deliveryMode", "Entrega", ["manual", "online"]), f("weightPercentage", "Ponderación (%)", { type: "number", default: 0 }), f("maxScore", "Puntuación máxima", { type: "number", default: 20 }), f("passingScore", "Puntuación mínima", { type: "number", default: 10 }), f("opensAt", "Apertura", { type: "datetime-local" }), f("closesAt", "Cierre", { type: "datetime-local" }), f("durationMinutes", "Duración (minutos)", { type: "number", default: 60 }), f("attemptsAllowed", "Intentos", { type: "number", default: 1 }), f("rubric", "Criterios de rúbrica", { type: "rubric", default: [] }), choices("status", "Estado", ["draft", "scheduled", "open", "closed", "graded", "archived"]), visible] },
    materials: { label: "Materiales", description: "Gestiona enlaces a guías, PDF, videos y otros recursos.", fields: [course, section, titleField, f("url", "Enlace HTTP/HTTPS", { required: true }), f("unit", "Unidad"), choices("kind", "Tipo", ["link", "pdf", "video", "guide"]), visible] },
    onlineClasses: { label: "Encuentros en línea", description: "Publica enlaces reales de reuniones o grabaciones y sus fechas.", fields: [course, section, titleField, f("url", "Enlace HTTP/HTTPS", { required: true }), f("unit", "Unidad"), f("startsAt", "Fecha y hora", { type: "datetime-local", default: null }), choices("kind", "Tipo", ["live", "recording"]), visible] },
    grades: { label: "Calificaciones", description: "Registra y corrige notas con validación de matrícula, sección y puntuación.", fields: [course, f("studentId", "Estudiante", { reference: "users", role: "student", required: true }), f("assessmentId", "Evaluación", { reference: "assessments", required: true }), f("score", "Puntuación", { type: "number", default: 0 }), f("feedback", "Retroalimentación", { type: "textarea" }), choices("status", "Estado", ["draft", "published"])] },
    attendance: { label: "Asistencia", description: "Registra asistencia por fecha y matrícula activa.", fields: [course, f("studentId", "Estudiante", { reference: "users", role: "student", required: true }), f("date", "Fecha", { type: "date", required: true }), choices("status", "Asistencia", ["present", "absent", "late", "excused"])] },
    settings: { label: "Configuración", description: "Configura la institución, período, aviso y cupo diario compartido de IA.", fields: [f("institutionName", "Institución", { required: true, default: "Smart Learn" }), f("academicPeriod", "Período actual", { required: true, default: "2026-III" }), f("supportEmail", "Correo de soporte"), f("announcement", "Aviso institucional", { type: "textarea" }), f("dailyAiLimit", "Consultas de IA por usuario/día UTC", { type: "number", default: 50 })] },
};
export const adminLabels: Record<string, string> = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido", student: "Estudiante", teacher: "Docente", admin: "Administrador", draft: "Borrador", archived: "Archivado", scheduled: "Programado", "in-progress": "En curso", completed: "Completado", open: "Abierto", closed: "Cerrado", graded: "Calificado", published: "Publicado", present: "Presente", absent: "Ausente", late: "Tarde", excused: "Justificado", "on-site": "Presencial", online: "En línea", hybrid: "Híbrida", manual: "Manual", assignment: "Actividad", exam: "Examen", quiz: "Cuestionario", workshop: "Taller", project: "Proyecto", presentation: "Exposición", practice: "Práctica", link: "Enlace", guide: "Guía", video: "Video", pdf: "PDF", live: "En vivo", recording: "Grabación", teal: "Turquesa", blue: "Azul", violet: "Violeta", amber: "Ámbar" };
