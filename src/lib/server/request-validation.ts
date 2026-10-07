import { z } from "zod";

export const documentId = z.string().trim().min(1).max(150)
  .refine(value => !value.includes("/") && value !== "." && value !== "..", "Identificador inválido.");
export class RequestInputError extends Error {
  status = 400;
}
export async function readRequestJson(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { throw new RequestInputError("El cuerpo debe contener JSON válido."); }
}
