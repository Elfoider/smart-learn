import type { Metadata } from "next";
import { AcademicResources } from "@/components/teacher/academic-resources";
export const metadata: Metadata = { title: "Materials" };
export default function Page() { return <AcademicResources kind="materials" />; }
