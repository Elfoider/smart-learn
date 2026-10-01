import type { Metadata } from "next";
import { LivePractice } from "@/components/playground/live-practice";
import { PlaygroundWorkspace } from "@/components/playground/playground-workspace";
export const metadata: Metadata = { title: "Playground académico", description: "Prácticas nuevas basadas en tus clases." };
export default async function StudentPlaygroundPage({ searchParams }: { searchParams: Promise<{ courseId?: string; lessonId?: string }> }) {
  const params = await searchParams;
  return <div className="space-y-8"><LivePractice initialCourseId={typeof params.courseId === "string" ? params.courseId : ""} initialLessonId={typeof params.lessonId === "string" ? params.lessonId : ""} />
    <details className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold">Explorar ejercicios de demostración</summary><p className="my-4 text-sm text-muted-foreground">Este banco fijo permite conocer la interfaz. Las prácticas nuevas de tus clases se generan arriba.</p><PlaygroundWorkspace /></details></div>;
}
