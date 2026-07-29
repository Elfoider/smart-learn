import { RoleGuard } from "@/components/auth/role-guard";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <RoleGuard allowedRole="student">
      {children}
    </RoleGuard>
  );
}