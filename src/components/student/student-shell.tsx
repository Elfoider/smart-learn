"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Home,
  LogOut,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";

interface StudentShellProps {
  children: React.ReactNode;
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
    href: "/student",
    icon: Home,
    exact: true,
  },
  {
    label: "Mis materias",
    href: "/student/courses",
    icon: BookOpen,
  },
  {
    label: "Calendario",
    href: "/student/calendar",
    icon: CalendarDays,
  },
  {
    label: "Playground",
    href: "/student/playground",
    icon: Sparkles,
  },
  {
    label: "Mi progreso",
    href: "/student/progress",
    icon: BarChart3,
  },
];

function getInitials(name?: string) {
  if (!name) {
    return "SL";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function StudentShell({
  children,
}: StudentShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    profile,
    signOut,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [closingSession, setClosingSession] =
    useState(false);

  function isActive(item: NavigationItem) {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  }

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

  const profileInitials = getInitials(
    profile?.name,
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card/85 px-5 py-6 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="px-2">
          <BrandMark />
        </div>

        <div className="mt-9 rounded-3xl border border-border bg-background/65 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {profileInitials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {profile?.name ?? "Estudiante"}
              </p>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                Portal estudiantil
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-1.5">
          <p className="mb-3 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Mi espacio
          </p>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex min-h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300",
                    !active &&
                      "group-hover:scale-105",
                  )}
                />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-primary/15 bg-secondary p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <p className="mt-4 text-sm font-semibold text-secondary-foreground">
            Asistente académico
          </p>

          <p className="mt-2 text-xs leading-5 text-secondary-foreground/70">
            Refuerza tus materias con prácticas y explicaciones guiadas.
          </p>

          <Link
            href="/student/playground"
            className="mt-4 inline-flex text-xs font-bold text-secondary-foreground transition-opacity hover:opacity-70"
          >
            Entrar al playground
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={closingSession}
          className="mt-4 flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
        >
          <LogOut
            aria-hidden="true"
            className="h-5 w-5"
          />

          {closingSession
            ? "Cerrando sesión..."
            : "Cerrar sesión"}
        </button>
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[96rem] items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(true);
              }}
              aria-label="Abrir navegación"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card lg:hidden"
            >
              <Menu
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <div className="hidden max-w-md flex-1 md:block">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  type="search"
                  placeholder="Buscar clases, materiales o actividades"
                  className="h-11 w-full rounded-2xl border border-border bg-card/65 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Ver notificaciones"
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card/70 text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
              >
                <Bell
                  aria-hidden="true"
                  className="h-5 w-5"
                />

                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
              </button>

              <ThemeToggle />

              <div className="hidden items-center gap-3 rounded-2xl border border-border bg-card/70 px-3 py-1.5 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
                  {profileInitials}
                </div>

                <div className="max-w-40">
                  <p className="truncate text-xs font-semibold">
                    {profile?.name}
                  </p>

                  <p className="truncate text-[0.68rem] text-muted-foreground">
                    Estudiante
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[96rem] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </div>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.6rem] border border-border bg-card/90 p-2 shadow-2xl backdrop-blur-2xl lg:hidden">
        {navigationItems.map((item) => {
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
                className="h-5 w-5"
              />

              <span className="max-w-full truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar navegación"
            onClick={() => {
              setMobileMenuOpen(false);
            }}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col border-r border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <BrandMark />

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                }}
                aria-label="Cerrar menú"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border"
              >
                <X
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-3xl border border-border bg-background/70 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground">
                {profileInitials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {profile?.name}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {profile?.email}
                </p>
              </div>
            </div>

            <nav className="mt-7 flex-1 space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-5 w-5"
                    />

                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={closingSession}
              className="flex min-h-12 items-center gap-3 rounded-2xl border border-border px-4 text-sm font-semibold text-muted-foreground"
            >
              <LogOut
                aria-hidden="true"
                className="h-5 w-5"
              />

              Cerrar sesión
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}