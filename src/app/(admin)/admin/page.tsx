import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";
export const metadata:Metadata={title:"Administración integral"};
export default function AdminPage() { return <AdminConsole/>; }
