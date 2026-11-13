"use client";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, CalendarDays, ClipboardCheck, Home, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { PortalFrame, type PortalItem } from "@/components/navigation/portal-frame";
const items: PortalItem[] = [
  { id: "/student", href: "/student", label: "Inicio", icon: Home },
  { id: "/student/courses", href: "/student/courses", label: "Mis materias", icon: BookOpen },
  { id: "/student/exams", href: "/student/exams", label: "Evaluaciones", icon: ClipboardCheck },
  { id: "/student/calendar", href: "/student/calendar", label: "Calendario", icon: CalendarDays },
  { id: "/student/playground", href: "/student/playground", label: "Playground", icon: Sparkles },
  { id: "/student/progress", href: "/student/progress", label: "Mi progreso", icon: BarChart3 },
];
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = [...items].reverse().find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return <PortalFrame role="student" items={items} currentId={current?.id || items[0].id}>{children}</PortalFrame>;
}
