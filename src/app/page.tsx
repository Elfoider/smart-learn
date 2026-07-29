import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/config/site";

const capabilities = [
  {
    title: "Experiencia estudiantil",
    description:
      "Salón virtual, contenidos organizados, progreso y prácticas guiadas.",
    icon: GraduationCap,
  },
  {
    title: "Gestión docente",
    description:
      "Planificación, evaluaciones, asistencia, materiales y reportes.",
    icon: Layers3,
  },
  {
    title: "Inteligencia académica",
    description:
      "Herramientas de IA para apoyar al docente y reforzar al estudiante.",
    icon: BrainCircuit,
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-5 text-foreground sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="ambient-grid absolute inset-0"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-primary"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-secondary"
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-7xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Sparkles
                aria-hidden="true"
                className="h-5 w-5"
              />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                {siteConfig.name}
              </p>

              <p className="text-xs text-muted-foreground">
                Academic Intelligence
              </p>
            </div>
          </div>

          <ThemeToggle />
        </header>

        <section className="flex flex-1 items-center py-12 lg:py-20">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4 text-primary"
                />

                Base técnica inicial configurada
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Una nueva manera de{" "}
                <span className="text-gradient">
                  enseñar, aprender y gestionar.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Smart Learn unifica la experiencia académica del
                estudiante con herramientas profesionales de gestión
                docente e inteligencia artificial.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/25"
                >
                  Ver acceso inicial

                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>

                <div className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border bg-card/60 px-6 py-3 text-sm font-medium text-muted-foreground backdrop-blur-xl">
                  Sprint 0 · Fundación del sistema
                </div>
              </div>
            </div>

            <div className="glass-panel relative rounded-[2rem] p-4 sm:p-6">
              <div className="rounded-[1.55rem] border border-border bg-background/55 p-5 sm:p-7">
                <div className="mb-7 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                      Arquitectura
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      Ecosistema Smart Learn
                    </h2>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <BrainCircuit
                      aria-hidden="true"
                      className="h-6 w-6"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {capabilities.map((capability) => {
                    const Icon = capability.icon;

                    return (
                      <article
                        key={capability.title}
                        className="group flex gap-4 rounded-2xl border border-border bg-card/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                          <Icon
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold">
                            {capability.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {capability.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Sistema bajo ambiente web para apoyo académico.
          </p>

          <p>Versión {siteConfig.version}</p>
        </footer>
      </div>
    </main>
  );
}