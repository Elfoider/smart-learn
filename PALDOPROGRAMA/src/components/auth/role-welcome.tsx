"use client";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";

interface RoleWelcomeProps {
  role: UserRole;
  title: string;
  description: string;
}

const roleInformation = {
  student: {
    label: "Portal estudiantil",
    icon: GraduationCap,
    features: [
      "Salón virtual",
      "Clases y materiales",
      "Progreso académico",
    ],
  },
  teacher: {
    label: "Portal docente",
    icon: BookOpen,
    features: [
      "Gestión de asignaturas",
      "Planificación académica",
      "Asistente docente con IA",
    ],
  },
  admin: {
    label: "Administración",
    icon: ShieldCheck,
    features: [
      "Usuarios y roles",
      "Configuración institucional",
      "Supervisión del sistema",
    ],
  },
} satisfies Record<
  UserRole,
  {
    label: string;
    icon: typeof GraduationCap;
    features: string[];
  }
>;

export function RoleWelcome({
  role,
  title,
  description,
}: RoleWelcomeProps) {
  const router = useRouter();

  const {
    profile,
    signOut,
  } = useAuth();

  const [closingSession, setClosingSession] =
    useState(false);

  const information = roleInformation[role];
  const Icon = information.icon;

  async function handleSignOut() {
    setClosingSession(true);

    try {
      await signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setClosingSession(false);
    }
  }

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

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-4">
          <BrandMark />

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              type="button"
              disabled={closingSession}
              onClick={handleSignOut}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-4 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card disabled:pointer-events-none disabled:opacity-60"
            >
              <LogOut
                aria-hidden="true"
                className="h-4 w-4"
              />

              <span className="hidden sm:inline">
                Cerrar sesión
              </span>
            </button>
          </div>
        </header>

        <section className="flex min-h-[calc(100vh-9rem)] items-center py-14">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_0.82fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4 text-primary"
                />

                {information.label}
              </div>

              <h1 className="mt-7 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-6xl">
                Hola,{" "}
                <span className="text-gradient">
                  {profile?.name ?? "usuario"}.
                </span>
              </h1>

              <h2 className="mt-5 text-xl font-semibold sm:text-2xl">
                {title}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                {description}
              </p>

              <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                Sesión verificada como{" "}
                <strong>{information.label}</strong>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Sprint 1.2
                  </p>

                  <h3 className="mt-2 text-xl font-semibold">
                    Acceso por rol completado
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <LayoutDashboard
                    aria-hidden="true"
                    className="h-6 w-6"
                  />
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {information.features.map(
                  (feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card/65 p-4"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                        <Sparkles
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </div>

                      <span className="flex-1 text-sm font-medium">
                        {feature}
                      </span>

                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-muted-foreground"
                      />
                    </div>
                  ),
                )}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-4">
                <Users
                  aria-hidden="true"
                  className="h-5 w-5 text-primary"
                />

                <div>
                  <p className="text-sm font-semibold">
                    {profile?.email}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    UID: {profile?.uid}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}