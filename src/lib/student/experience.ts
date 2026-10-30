import type { TeacherAssessment } from "../../types/teacher-assessment.ts";

export type AssessmentState = "available" | "upcoming" | "closed" | "graded" | "archived";
export const assessmentLabels: Record<AssessmentState, string> = { available: "Disponible", upcoming: "Próximamente", closed: "Finalizada", graded: "Calificación publicada", archived: "Archivada" };
export function assessmentState(item: Pick<TeacherAssessment, "status" | "opensAt" | "closesAt">, now: number, hasGrade = false): AssessmentState {
  if (item.status === "archived") return "archived";
  if (hasGrade) return "graded";
  if (["closed", "graded"].includes(item.status)) return "closed";
  const opening = Date.parse(item.opensAt), closing = Date.parse(item.closesAt);
  if (Number.isFinite(closing) && now > closing) return "closed";
  if (item.status !== "open" || Number.isFinite(opening) && now < opening) return "upcoming";
  return "available";
}
export function formatAcademicDate(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Por confirmar";
  return new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
export function courseLearning(lessons: { id: string; courseId: string; unit?: string; title: string; startDate?: string }[], courseId: string, progress?: { currentLessonId?: string; completedLessonIds?: string[] }) {
  const published = lessons.filter(l => l.courseId === courseId).sort((a,b) => (a.unit || "").localeCompare(b.unit || "", "es", { numeric: true }) || (a.startDate || "").localeCompare(b.startDate || "") || a.title.localeCompare(b.title));
  const completedIds = new Set(progress?.completedLessonIds || []);
  const completed = published.filter(l => completedIds.has(l.id)).length;
  const next = published.find(l => l.id === progress?.currentLessonId && !completedIds.has(l.id)) || published.find(l => !completedIds.has(l.id));
  return { total: published.length, completed, percent: published.length ? Math.round(completed / published.length * 100) : 0, next, state: published.length > 0 && completed === published.length ? "completed" : completed > 0 || published.some(l => l.id === progress?.currentLessonId) ? "started" : "new" };
}
export function instructionSteps(text: string) { return text.split(/\n\s*\n|\n(?=\s*(?:\d+[.)]|[-•])\s)/).map(s => s.trim()).filter(Boolean); }
export function safeMeetingUrl(url: string) { try { return ["http:", "https:"].includes(new URL(url).protocol); } catch { return false; } }
