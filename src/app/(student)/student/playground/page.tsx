import type { Metadata } from "next";
import { LivePractice } from "@/components/playground/live-practice";

import { PlaygroundWorkspace } from "@/components/playground/playground-workspace";

export const metadata: Metadata = {
  title: "Playground académico",
  description:
    "Ejercicios y prácticas académicas guiadas para estudiantes.",
};

export default function StudentPlaygroundPage() {
  return <div className="space-y-10"><LivePractice /><section><h2 className="mb-3 text-xl font-semibold">Ejercicios de demostración</h2><PlaygroundWorkspace /></section></div>;
}
