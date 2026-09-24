import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface StudentPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function StudentPlaceholder({
  eyebrow,
  title,
  description,
  icon: Icon,
}: StudentPlaceholderProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-card/70 p-6 text-center shadow-sm backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--primary)_16%,transparent),transparent_45%)]"
      />

      <div className="relative z-10 max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20">
          <Icon
            aria-hidden="true"
            className="h-7 w-7"
          />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Sparkles
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          {eyebrow}
        </div>

        <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>

        <Link
          href="/student"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />

          Regresar al salón
        </Link>
      </div>
    </section>
  );
}