"use client";
import { useState } from "react";
import { TeacherAssessmentManager } from "@/components/teacher/teacher-assessment-manager";
import { TeacherGradebookManager } from "@/components/teacher/teacher-gradebook-manager";
export function TeacherAssessmentWorkspace() {
  const [view, setView] = useState("assessments");
  return <div className="space-y-4">
    <details className="workspace-switch rounded-xl border border-border bg-card px-4 py-2">
      <summary className="cursor-pointer text-sm font-medium">Herramienta: {view === "assessments" ? "Evaluaciones y rúbricas" : "Libro de calificaciones"}</summary>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Cambiar herramienta de evaluación">
        {[{ id: "assessments", title: "Evaluaciones y rúbricas" }, { id: "grades", title: "Libro de calificaciones" }].map(item => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={e => { setView(item.id); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="rounded-xl border border-border px-4 py-2 text-sm aria-pressed:bg-primary aria-pressed:text-primary-foreground">{item.title}</button>)}
      </div>
    </details>
    {view === "assessments" ? <TeacherAssessmentManager /> : <TeacherGradebookManager />}
  </div>;
}
