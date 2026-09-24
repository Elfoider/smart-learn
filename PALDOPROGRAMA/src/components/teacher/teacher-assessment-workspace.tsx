"use client";

import {
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";

import { TeacherAssessmentManager } from "@/components/teacher/teacher-assessment-manager";
import { TeacherGradebookManager } from "@/components/teacher/teacher-gradebook-manager";
import { cn } from "@/lib/utils/cn";

type WorkspaceView =
  | "assessments"
  | "grades";

export function TeacherAssessmentWorkspace() {
  const [view, setView] =
    useState<WorkspaceView>(
      "assessments",
    );

  return (
    <div className="space-y-6">
      <section className="rounded-[1.7rem] border border-border bg-card/75 p-3 shadow-sm backdrop-blur-xl">
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setView(
                "assessments",
              );
            }}
            className={cn(
              "flex min-h-14 items-center justify-center gap-3 rounded-[1.3rem] px-5 text-sm font-semibold transition-all",
              view === "assessments"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <ClipboardCheck
              aria-hidden="true"
              className="h-5 w-5"
            />

            Evaluaciones y rúbricas
          </button>

          <button
            type="button"
            onClick={() => {
              setView("grades");
            }}
            className={cn(
              "flex min-h-14 items-center justify-center gap-3 rounded-[1.3rem] px-5 text-sm font-semibold transition-all",
              view === "grades"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <GraduationCap
              aria-hidden="true"
              className="h-5 w-5"
            />

            Libro de calificaciones
          </button>
        </div>
      </section>

      {view === "assessments" ? (
        <TeacherAssessmentManager />
      ) : (
        <TeacherGradebookManager />
      )}
    </div>
  );
}