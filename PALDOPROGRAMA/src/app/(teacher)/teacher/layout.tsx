import { RoleGuard } from "@/components/auth/role-guard";
import { TeacherShell } from "@/components/teacher/teacher-shell";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({
  children,
}: TeacherLayoutProps) {
  return (
    <RoleGuard allowedRole="teacher">
      <TeacherShell>
        {children}
      </TeacherShell>
    </RoleGuard>
  );
}