import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  LockKeyhole,
  Sparkles,
} from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Acceso seguro a Smart Learn.",
};

export default function LoginFoundationPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div
        aria-hidden="true"
        className="ambient-grid absolute inset-0"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-primary"
      />

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <section className="glass-panel relative z-10 w-full max-w-md rounded-[2rem] p-6 sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
          <LockKeyhole
            aria-hidden="true"
            className="h-6 w-6"
          />
        </div>

        <div className="mt-7">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles
              aria-hidden="true"
              className="h-4 w-4"
            />

            Próximo desarrollo
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
            Login premium de Smart Learn
          </h1>

          <p className="mt-4 leading-7 text-muted-foreground">
            La estructura de acceso ya está preparada. El siguiente
            bloque incorporará el diseño completo, validaciones,
            animaciones y autenticación.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
          Sprint 0 completado parcialmente. Firebase todavía no ha
          sido conectado.
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />

          Regresar al inicio
        </Link>
      </section>
    </main>
  );
}