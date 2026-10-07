// Devuelve mensajes públicos sin reenviar detalles del proveedor ni credenciales.
export function aiFailure(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "ollama/gateway-429") return { status: 429, message: "La IA local está atendiendo otra consulta. Espera unos segundos y vuelve a intentarlo." };
  if (code === "ollama/gateway-504" || (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))) return { status: 504, message: "La IA tardó demasiado. Comprueba que el modelo esté cargado y vuelve a intentarlo." };
  if (code.includes("missing-config") || code === "ai/invalid-provider" || code.includes("https-required") || code.includes("invalid-url") || code.includes("gateway-401")) return { status: 503, message: "Revisa la configuración del proveedor de IA en el servidor." };
  return { status: 502, message: "La IA no pudo responder. Comprueba que Ollama y el servicio local estén en línea y vuelve a intentarlo." };
}
