import type { Metadata } from "next";

import { PlaygroundWorkspace } from "@/components/playground/playground-workspace";

export const metadata: Metadata = {
  title: "Playground académico",
  description:
    "Ejercicios y prácticas académicas guiadas para estudiantes.",
};

export default function StudentPlaygroundPage() {
  return <PlaygroundWorkspace />;
}