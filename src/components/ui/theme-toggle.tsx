"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils/cn";

interface ThemeToggleProps {
  className?: string;
}

const subscribe = () => {
  return () => undefined;
};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle({ className }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }

  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "h-11 w-11 rounded-2xl border border-border bg-card/70",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Cambiar al modo claro"
          : "Cambiar al modo oscuro"
      }
      title={
        isDark
          ? "Cambiar al modo claro"
          : "Cambiar al modo oscuro"
      }
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center",
        "rounded-2xl border border-border bg-card/70",
        "text-foreground shadow-sm backdrop-blur-xl",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/40",
        "hover:bg-card hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        className,
      )}
    >
      {isDark ? (
        <Sun
          aria-hidden="true"
          className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
        />
      ) : (
        <Moon
          aria-hidden="true"
          className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12"
        />
      )}
    </button>
  );
}