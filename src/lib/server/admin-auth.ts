import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
export class AdminError extends Error {
    status: number;
    constructor(message: string, status = 400) { super(message); this.status = status; }
}
export async function requireAdmin(request: Request) {
    const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
    if (!token)
        throw new AdminError("Debes iniciar sesión.", 401);
    let uid: string;
    try {
        uid = (await getAdminAuth().verifyIdToken(token)).uid;
    }
    catch {
        throw new AdminError("La sesión no es válida.", 401);
    }
    const profile = (await getAdminDb().collection("users").doc(uid).get()).data();
    if (profile?.role !== "admin" || profile.status !== "active")
        throw new AdminError("Solo un administrador activo puede realizar esta operación.", 403);
    return uid;
}
