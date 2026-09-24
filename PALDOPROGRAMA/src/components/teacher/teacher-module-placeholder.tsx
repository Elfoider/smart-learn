import type {
  LucideIcon,
} from "lucide-react";
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface TeacherModulePlaceholderProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

export function TeacherModulePlaceholder({
  icon: Icon,
  eyebrow,
  title,
  description,
  features,
}: TeacherModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#071a22] p-6 text-white shadow-2xl sm:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(45,222,199,0.25),transparent_34%),radial-gradient(circle_at_88%_88%,rgba(117,104,255,0.24),transparent_36%)]"
        />

        <div className="relative z-10 max-w-3xl">
          <Link
            href="/teacher"
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-xs font-semibold text-white/70"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-4 w-4"
            />

            Volver al inicio
          </Link>

          <div className="mt-9 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#59e4d2] text-[#05231f]">
            <Icon
              aria-hidden="true"
              className="h-6 w-6"
            />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#62ead8]">
            {eyebrow}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {title}
          </h1>

          <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border bg-card/75 p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <Sparkles
            aria-hidden="true"
            className="h-5 w-5 text-primary"
          />

          <h2 className="text-lg font-semibold">
            Funcionalidades previstas
          </h2>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-4"
            >
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              />

              <p className="text-sm leading-6 text-muted-foreground">
                {feature}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-primary/15 bg-secondary p-5">
          <p className="text-sm font-semibold text-secondary-foreground">
            Módulo preparado
          </p>

          <p className="mt-2 text-sm leading-6 text-secondary-foreground/70">
            La ruta y la navegación ya funcionan. Su gestión completa con Firestore se desarrollará en los próximos sprints.
          </p>
        </div>
      </section>
    </div>
  );
}