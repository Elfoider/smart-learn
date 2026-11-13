"use client";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, Bot, CalendarCheck, ClipboardCheck, FolderOpen, Home, NotebookPen, Presentation, Users, Video } from "lucide-react";
import { usePathname } from "next/navigation";
import { PortalFrame, type PortalItem } from "@/components/navigation/portal-frame";
const items: PortalItem[] = [
  { id: "/teacher", href: "/teacher", label: "Inicio", icon: Home },
  { id: "/teacher/courses", href: "/teacher/courses", label: "Asignaturas", icon: BookOpen },
  { id: "/teacher/students", href: "/teacher/students", label: "Estudiantes", icon: Users },
  { id: "/teacher/planning", href: "/teacher/planning", label: "Planificación", icon: NotebookPen },
  { id: "/teacher/assessments", href: "/teacher/assessments", label: "Evaluaciones", icon: ClipboardCheck },
  { id: "/teacher/attendance", href: "/teacher/attendance", label: "Asistencia", icon: CalendarCheck },
  { id: "/teacher/materials", href: "/teacher/materials", label: "Materiales", icon: FolderOpen },
  { id: "/teacher/presentations", href: "/teacher/presentations", label: "Presentaciones", icon: Presentation },
  { id: "/teacher/online-classes", href: "/teacher/online-classes", label: "Clases en línea", icon: Video },
  { id: "/teacher/ai", href: "/teacher/ai", label: "Asistente IA", icon: Bot },
  { id: "/teacher/reports", href: "/teacher/reports", label: "Reportes", icon: BarChart3 },
];
export function TeacherShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const current = [...items].reverse().find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return <PortalFrame role="teacher" items={items} currentId={current?.id || items[0].id}>{children}</PortalFrame>;
}
