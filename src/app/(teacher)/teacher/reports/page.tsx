import type { Metadata } from "next";
import { AcademicReports } from "@/components/teacher/academic-reports";
export const metadata: Metadata = { title: "Reports" };
export default function Page() { return <AcademicReports />; }
