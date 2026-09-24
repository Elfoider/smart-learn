import type { Metadata } from "next";

import { LoginExperience } from "@/components/auth/login-experience";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description:
    "Accede de forma segura a la plataforma académica Smart Learn.",
};

export default function LoginPage() {
  return <LoginExperience />;
}