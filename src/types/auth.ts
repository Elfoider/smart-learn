export type UserRole = "admin" | "teacher" | "student";

export type UserStatus = "active" | "inactive" | "suspended";

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  teacher: "Docente",
  student: "Estudiante",
};

export const USER_ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};