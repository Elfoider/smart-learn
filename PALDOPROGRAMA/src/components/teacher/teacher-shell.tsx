"use client";

import type {
  LucideIcon,
} from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarCheck2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Sparkles,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase/client";
import { cn } from "@/lib/utils/cn";

interface TeacherShellProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Inicio",
    href: "/teacher",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Asignaturas",
    href: "/teacher/courses",
    icon: BookOpen,
  },
  {
    label: "Estudiantes",
    href: "/teacher/students",
    icon: Users,
  },
  {
    label: "Planificación",
    href: "/teacher/planning",
    icon: FileText,
  },
  {
    label: "Evaluaciones",
    href: "/teacher/assessments",
    icon: ClipboardCheck,
  },
  {
    label: "Asistencia",
    href: "/teacher/attendance",
    icon: CalendarCheck2,
  },
  {
    label: "Materiales",
    href: "/teacher/materials",
    icon: GraduationCap,
  },
  {
    label: "Asistente IA",
    href: "/teacher/ai",
    icon: Bot,
  },
  {
    label: "Reportes",
    href: "/teacher/reports",
    icon: BarChart3,
  },
];

const mobileNavigationItems: NavigationItem[] = [
  navigationItems[0],
  navigationItems[1],
  navigationItems[2],
  navigationItems[7],
];

export function TeacherShell({
  children,
}: TeacherShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [signingOut, setSigningOut] =
    useState(false);

  const teacherName =
    profile?.name?.trim() || "Docente";

  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  function isActive(
    item: NavigationItem,
  ) {
    if (item.exact) {
      return pathname === item.href;
    }

    return (
      pathname === item.href ||
      pathname.startsWith(
        `${item.href}/`,
      )
    );
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOut(auth);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error,
      );

      toast.error(
        "No fue posible cerrar la sesión",
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17.5rem] border-r border-border bg-card/90 backdrop-blur-2xl lg:flex lg:flex-col">
        <TeacherSidebarContent
          pathname={pathname}
          teacherName={teacherName}
          initials={initials}
          signingOut={signingOut}
          isActive={isActive}
          onNavigate={() => undefined}
          onSignOut={handleSignOut}
        />
      </aside>

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-2xl">
          <div className="flex min-h-18 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(true);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <div className="relative hidden max-w-xl flex-1 md:block">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="search"
                placeholder="Buscar asignaturas, estudiantes o actividades"
                className="h-11 w-full rounded-2xl border border-border bg-card/70 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            </div>

            <div className="min-w-0 flex-1 md:hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Portal docente
              </p>

              <p className="mt-1 truncate text-sm font-semibold">
                Smart Learn
              </p>
            </div>

            <Link
              href="/teacher/ai"
              className="hidden min-h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 sm:flex"
            >
              <WandSparkles
                aria-hidden="true"
                className="h-4 w-4"
              />

              Crear con IA
            </Link>

            <ThemeToggle />

            <div className="hidden items-center gap-3 rounded-2xl border border-border bg-card/70 py-1.5 pl-2 pr-3 xl:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                {initials || "D"}
              </div>

              <div className="max-w-40">
                <p className="truncate text-xs font-semibold">
                  {teacherName}
                </p>

                <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                  Docente universitario
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mx-auto w-full max-w-[100rem]">
            {children}
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-[1.7rem] border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {mobileNavigationItems.map(
          (item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.62rem] font-semibold transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4"
                />

                {item.label}
              </Link>
            );
          },
        )}

        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(true);
          }}
          className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.62rem] font-semibold text-muted-foreground"
        >
          <Menu
            aria-hidden="true"
            className="h-4 w-4"
          />

          Menú
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => {
              setMobileMenuOpen(false);
            }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[90%] max-w-sm flex-col border-r border-border bg-card shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-background"
              aria-label="Cerrar panel"
            >
              <X
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <TeacherSidebarContent
              pathname={pathname}
              teacherName={teacherName}
              initials={initials}
              signingOut={signingOut}
              isActive={isActive}
              onNavigate={() => {
                setMobileMenuOpen(false);
              }}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}
    </div>
  );
}

interface TeacherSidebarContentProps {
  pathname: string;
  teacherName: string;
  initials: string;
  signingOut: boolean;
  isActive: (
    item: NavigationItem,
  ) => boolean;
  onNavigate: () => void;
  onSignOut: () => Promise<void>;
}

function TeacherSidebarContent({
  teacherName,
  initials,
  signingOut,
  isActive,
  onNavigate,
  onSignOut,
}: TeacherSidebarContentProps) {
  return (
    <>
      <div className="border-b border-border px-5 py-5">
        <Link
          href="/teacher"
          onClick={onNavigate}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div>
            <p className="text-base font-semibold tracking-[-0.03em]">
              Smart Learn
            </p>

            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary">
              Portal docente
            </p>
          </div>
        </Link>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary p-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground">
            {initials || "D"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-secondary-foreground">
              {teacherName}
            </p>

            <p className="mt-1 text-[0.65rem] text-secondary-foreground/65">
              Período académico 2026-III
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.17em] text-muted-foreground">
          Gestión académica
        </p>

        <div className="space-y-1.5">
          {navigationItems.map(
            (item) => {
              const Icon = item.icon;
              const active = isActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-4.5 w-4.5 shrink-0"
                  />

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:translate-x-0.5",
                      active
                        ? "text-primary-foreground/65"
                        : "text-muted-foreground/50",
                    )}
                  />
                </Link>
              );
            },
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-[#071a22] p-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#59e4d2] text-[#05231f]">
            <Bot
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <p className="mt-4 text-sm font-semibold">
            Copiloto docente
          </p>

          <p className="mt-2 text-xs leading-5 text-white/55">
            Genera planificaciones, rúbricas y actividades académicas.
          </p>

          <Link
            href="/teacher/ai"
            onClick={onNavigate}
            className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#59e4d2] px-3 text-xs font-bold text-[#05231f]"
          >
            <WandSparkles
              aria-hidden="true"
              className="h-4 w-4"
            />

            Abrir asistente
          </Link>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => {
            void onSignOut();
          }}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium text-muted-foreground transition-all hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-50"
        >
          <LogOut
            aria-hidden="true"
            className="h-4 w-4"
          />

          {signingOut
            ? "Cerrando sesión"
            : "Cerrar sesión"}
        </button>
      </div>
    </>
  );
}