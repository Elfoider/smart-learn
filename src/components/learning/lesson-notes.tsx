"use client";

import {
  CheckCircle2,
  LoaderCircle,
  NotebookPen,
  Save,
} from "lucide-react";

import { useLessonNote } from "@/hooks/use-lesson-note";
import { cn } from "@/lib/utils/cn";

interface LessonNotesProps {
  courseId: string;
  lessonId: string;
}

export function LessonNotes({
  courseId,
  lessonId,
}: LessonNotesProps) {
  const {
    content,
    setContent,
    loading,
    saving,
    dirty,
    save,
  } = useLessonNote({
    courseId,
    lessonId,
  });

  return (
    <article className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <NotebookPen
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Espacio personal
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              Mis notas de la clase
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {!loading && !dirty && (
            <>
              <CheckCircle2
                aria-hidden="true"
                className="h-4 w-4 text-primary"
              />

              Sincronizada
            </>
          )}
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border border-border bg-background/60">
            <LoaderCircle
              aria-hidden="true"
              className="h-6 w-6 animate-spin text-primary"
            />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            maxLength={4000}
            placeholder="Escribe aquí conceptos importantes, dudas, ejemplos o recordatorios..."
            className="min-h-44 w-full resize-y rounded-2xl border border-border bg-background/60 p-4 text-sm leading-7 outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {content.length} de 4000 caracteres
        </p>

        <button
          type="button"
          disabled={
            loading ||
            saving ||
            !dirty
          }
          onClick={() => {
            void save();
          }}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition-all",
            dirty
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:-translate-y-0.5"
              : "border border-border bg-muted text-muted-foreground",
            "disabled:pointer-events-none disabled:opacity-60",
          )}
        >
          {saving ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />

              Guardando
            </>
          ) : (
            <>
              <Save
                aria-hidden="true"
                className="h-4 w-4"
              />

              Guardar nota
            </>
          )}
        </button>
      </div>
    </article>
  );
}