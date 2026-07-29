import { RoleGuard } from "@/components/auth/role-guard";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export default function TeacherLayout({
  children,
}: TeacherLayoutProps) {
  return (
    <RoleGuard allowedRole="teacher">
      {children}
    </RoleGuard>
  );
}