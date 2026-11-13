import type { Metadata } from "next";
import { TeacherPresentations } from "@/components/teacher/teacher-presentations";

export const metadata: Metadata = { title: "Presentaciones docentes" };

export default function Page() {
  return <TeacherPresentations />;
}
