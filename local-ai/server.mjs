import http from "node:http";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";

export function createGateway({ token, model = "qwen2.5:3b", ollamaUrl = "http://127.0.0.1:11434", timeoutMs = 55000, fetchImpl = fetch }) {
  if (!token || token.length < 32 || /\s/.test(token)) throw new Error("LOCAL_AI_TOKEN debe tener al menos 32 caracteres, sin espacios.");
  const origin = new URL(ollamaUrl);
  if (origin.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(origin.hostname)) throw new Error("Ollama debe ser local.");
  let active = false;
  const send = (res, status, data) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify(data));
  };
  const server = http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") return send(res, 200, { status: "ok", service: "smart-learn-local-ai" });
    const supplied = Buffer.from(req.headers.authorization || "");
    const expected = Buffer.from(`Bearer ${token}`);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return send(res, 401, { error: "unauthorized" });
    if (req.url !== "/v1/generate") return send(res, 404, { error: "not-found" });
    if (req.method !== "POST") return send(res, 405, { error: "method-not-allowed" });
    if (!(req.headers["content-type"] || "").startsWith("application/json")) return send(res, 415, { error: "json-required" });
    if (active) return send(res, 429, { error: "busy" });
    active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    res.on("close", () => { if (!res.writableEnded) controller.abort(); });
    try {
      const chunks = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 65536) { send(res, 413, { error: "body-too-large" }); return; }
        chunks.push(chunk);
      }
      let data;
      try { data = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
      catch { return send(res, 400, { error: "invalid-json" }); }
      if (!data || typeof data !== "object" || data.model !== model ||
          typeof data.systemInstruction !== "string" || !data.systemInstruction.trim() || data.systemInstruction.length > 10000 ||
          typeof data.contents !== "string" || !data.contents.trim() || data.contents.length > 40000 ||
          !Number.isInteger(data.maxOutputTokens) || data.maxOutputTokens < 1 || data.maxOutputTokens > 1200 ||
          (data.responseMimeType !== undefined && data.responseMimeType !== "application/json")) {
        return send(res, 400, { error: "invalid-request" });
      }
      const response = await fetchImpl(new URL("/api/chat", origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model, stream: false, keep_alive: "30m",
          ...(model.startsWith("qwen3") ? { think: false } : {}),
          ...(data.responseMimeType === "application/json" ? { format: "json" } : {}),
          messages: [{ role: "system", content: data.systemInstruction }, { role: "user", content: data.contents }],
          options: { num_ctx: 4096, num_predict: data.maxOutputTokens, temperature: 0.3 },
        }),
      });
      if (!response.ok) return send(res, 502, { error: "ollama-unavailable" });
      const output = await response.json();
      if (typeof output.message?.content !== "string" || !output.message.content.trim()) return send(res, 502, { error: "empty-response" });
      if (output.done_reason === "length") return send(res, 502, { error: "response-truncated" });
      send(res, 200, { text: output.message.content.trim(), model, provider: "ollama" });
    } catch {
      // Do not log prompts, student data or authorization secrets.
      if (!res.destroyed) send(res, controller.signal.aborted ? 504 : 502, { error: controller.signal.aborted ? "timeout" : "ollama-unavailable" });
    } finally {
      clearTimeout(timer);
      active = false;
    }
  });
  server.requestTimeout = timeoutMs + 5000;
  server.headersTimeout = 10000;
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.LOCAL_AI_PORT || 8787);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Puerto inválido");
  const server = createGateway({ token: process.env.LOCAL_AI_TOKEN, model: process.env.OLLAMA_MODEL || "qwen2.5:3b" });
  server.listen(port, "127.0.0.1", () => console.log(`Servicio protegido listo en http://127.0.0.1:${port}`));
}
