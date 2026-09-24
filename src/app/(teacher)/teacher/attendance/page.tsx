import type { Metadata } from "next";
import { AttendanceManager } from "@/components/teacher/attendance-manager";
export const metadata: Metadata = { title: "Attendance" };
export default function Page() { return <AttendanceManager />; }
