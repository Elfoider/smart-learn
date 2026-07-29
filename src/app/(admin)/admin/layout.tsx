import { RoleGuard } from "@/components/auth/role-guard";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <RoleGuard allowedRole="admin">
      {children}
    </RoleGuard>
  );
}