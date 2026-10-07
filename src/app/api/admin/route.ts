import { z } from "zod";
import { NextResponse } from "next/server";
import { requireAdmin, AdminError } from "@/lib/server/admin-auth";
import { adminList, adminSummary, adminReport, adminSave, createAdminUser } from "@/lib/server/admin-service";
import { adminSchemas, type AdminResource } from "@/lib/admin/catalog";
import { documentId, readRequestJson, RequestInputError } from "@/lib/server/request-validation";
export const runtime = "nodejs";
const reason = z.string().trim().min(8, "Explica el motivo con al menos 8 caracteres.").max(500);
const resource = z.enum(Object.keys(adminSchemas) as [
    AdminResource,
    ...AdminResource[]
]);
const input = z.discriminatedUnion("action", [
    z.object({ action: z.literal("save"), resource, id: documentId.nullable(), data: z.unknown(), reason }).strict(),
    z.object({ action: z.literal("create-user"), email: z.email().max(254).transform(v => v.trim().toLowerCase()), name: z.string().trim().min(2).max(180), role: z.enum(["student", "teacher", "admin"]), reason }).strict(),
]);
function response(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } }); }
function handleError(error: unknown) {
    if (error instanceof AdminError || error instanceof RequestInputError)
        return response({ error: error.message }, error.status);
    if (error instanceof z.ZodError)
        return response({ error: error.issues.map(i => i.message).slice(0, 3).join(" · ") }, 400);
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "unknown";
    console.error("admin/operation-failed", code);
    if (code === "auth/insufficient-permission")
        return response({ error: "La identidad del servidor necesita permisos para consultar y crear usuarios de Firebase Authentication. Revisa el paso 4 de GUIA_ADMIN.md." }, 503);
    if (code === "auth/email-already-exists")
        return response({ error: "Ese correo acaba de registrarse. Reintenta para vincular la cuenta existente." }, 409);
    return response({ error: "No se pudo completar la operación administrativa. Revisa la configuración del servidor y reintenta." }, 500);
}
export async function GET(request: Request) {
    try {
        await requireAdmin(request);
        const params = new URL(request.url).searchParams;
        if (params.get("resource") === "reports")
            return response(await adminReport());
        if (params.get("resource") === "summary")
            return response(await adminSummary());
        const name = z.union([resource, z.enum(["adminAudit", "aiLogs"])]).parse(params.get("resource"));
        const cursor = params.get("cursor");
        if (cursor)
            documentId.parse(cursor);
        return response(await adminList(name, cursor || undefined));
    }
    catch (error) {
        return handleError(error);
    }
}
export async function POST(request: Request) {
    try {
        const uid = await requireAdmin(request);
        const body = input.parse(await readRequestJson(request));
        if (body.action === "create-user")
            return response(await createAdminUser(uid, body, body.reason), 201);
        return response(await adminSave(uid, body.resource, body.id, body.data, body.reason));
    }
    catch (error) {
        return handleError(error);
    }
}
