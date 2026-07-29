"use client";

import {
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface ResourceDownloadsProps {
  courseTitle: string;
  lessonTitle: string;
  resources: string[];
}

function normalizeFileName(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function downloadResource(
  resource: string,
  courseTitle: string,
  lessonTitle: string,
) {
  const content = [
    "SMART LEARN",
    "Recurso académico",
    "",
    `Materia: ${courseTitle}`,
    `Lección: ${lessonTitle}`,
    `Recurso: ${resource}`,
    "",
    "Este archivo representa un material descargable del prototipo.",
    "En la integración docente, será sustituido por el documento real cargado en Firebase Storage.",
  ].join("\n");

  const blob = new Blob(
    [content],
    {
      type: "text/plain;charset=utf-8",
    },
  );

  const objectUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = objectUrl;
  link.download = `${normalizeFileName(
    resource,
  )}.txt`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);

  toast.success("Descarga iniciada", {
    description: resource,
  });
}

export function ResourceDownloads({
  courseTitle,
  lessonTitle,
  resources,
}: ResourceDownloadsProps) {
  return (
    <article className="rounded-[1.8rem] border border-border bg-card/75 p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Materiales
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            Recursos de apoyo
          </h3>
        </div>

        <Download
          aria-hidden="true"
          className="h-5 w-5 text-muted-foreground"
        />
      </div>

      <div className="mt-5 space-y-3">
        {resources.map((resource) => (
          <button
            key={resource}
            type="button"
            onClick={() => {
              downloadResource(
                resource,
                courseTitle,
                lessonTitle,
              );
            }}
            className="group flex min-h-12 w-full items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 text-left text-sm font-medium transition-all hover:border-primary/30 hover:bg-background"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <FileText
                aria-hidden="true"
                className="h-4 w-4"
              />
            </div>

            <span className="flex-1">
              {resource}
            </span>

            <Download
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary"
            />
          </button>
        ))}
      </div>
    </article>
  );
}