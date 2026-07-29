import { RoleGuard } from "@/components/auth/role-guard";
import { StudentShell } from "@/components/student/student-shell";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <RoleGuard allowedRole="student">
      <StudentShell>
        {children}
      </StudentShell>
    </RoleGuard>
  );
}