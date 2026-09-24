"use client";

import { LoaderCircle } from "lucide-react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";
import { USER_ROLE_ROUTES } from "@/types/auth";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({
  allowedRole,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    profile,
    loading,
    signOut,
  } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user || !profile) {
      router.replace(
        `/login?next=${encodeURIComponent(pathname)}`,
      );

      return;
    }

    if (profile.status !== "active") {
      void signOut().finally(() => {
        router.replace("/login");
      });

      return;
    }

    if (profile.role !== allowedRole) {
      router.replace(
        USER_ROLE_ROUTES[profile.role],
      );
    }
  }, [
    allowedRole,
    loading,
    pathname,
    profile,
    router,
    signOut,
    user,
  ]);

  const authorized =
    !loading &&
    Boolean(user) &&
    Boolean(profile) &&
    profile?.status === "active" &&
    profile.role === allowedRole;

  if (!authorized) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
        <div
          aria-hidden="true"
          className="ambient-grid absolute inset-0"
        />

        <div className="glass-panel relative z-10 flex flex-col items-center rounded-[2rem] px-10 py-9 text-center">
          <LoaderCircle
            aria-hidden="true"
            className="h-8 w-8 animate-spin text-primary"
          />

          <p className="mt-4 text-sm font-semibold">
            Verificando acceso
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Estamos preparando tu espacio académico.
          </p>
        </div>
      </main>
    );
  }

  return children;
}