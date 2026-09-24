import type { Metadata } from "next";
import { TeacherAiWorkspace } from "@/components/teacher/teacher-ai-workspace";
export const metadata: Metadata = { title: "Ai" };
export default function Page() { return <TeacherAiWorkspace />; }
