"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function PublicationPreview({ title, course, section, visible, children }: {
  title: string;
  course?: string;
  section?: string;
  visible: boolean;
  children: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border border-primary/25 bg-background p-5">
      <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold text-primary">Revisar antes de guardar</h2>
      <p className="text-sm text-muted-foreground">{course} · {section ?? "Todas las secciones"}</p>
      <p role="status" className="text-sm font-medium">
        {visible ? "Visible para estudiantes al guardar." : "Oculto para estudiantes al guardar."}
      </p>
      <h3 className="break-words text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function PreviewContent({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
