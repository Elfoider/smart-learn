import test from "node:test";
import assert from "node:assert/strict";
import { createGateway } from "../local-ai/server.mjs";

const token = "test-secret-".repeat(4);
const payload = { model: "qwen2.5:3b", systemInstruction: "Tutor español", contents: "¿Qué son props?", maxOutputTokens: 300 };
async function setup(t, fetchImpl, timeoutMs = 1000) {
  const server = createGateway({ token, fetchImpl, timeoutMs });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, request: (body = payload, auth = token) => fetch(base + "/v1/generate", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` }, body: JSON.stringify(body),
  }) };
}
test("sin clave, clave errónea y cuerpo inválido no llegan a Ollama", async t => {
  let calls = 0;
  const { request } = await setup(t, async () => { calls++; });
  assert.equal((await request(payload, "")).status, 401);
  assert.equal((await request(payload, "wrong")).status, 401);
  assert.equal((await request({ ...payload, model: "otro-modelo" })).status, 400);
  assert.equal((await request({ ...payload, contents: "x".repeat(70000) })).status, 413);
  assert.equal(calls, 0);
});
test("clave válida genera texto y conserva contexto y formato JSON", async t => {
  const { request, base } = await setup(t, async (url, init) => {
    assert.equal(new URL(url).pathname, "/api/chat");
    const data = JSON.parse(init.body);
    assert.equal(data.model, payload.model);
    assert.equal(data.format, "json");
    assert.equal(data.messages[0].content, payload.systemInstruction);
    assert.equal(data.messages[1].content, payload.contents);
    assert.equal(data.stream, false);
    return Response.json({ message: { content: '{"question":"prueba"}' }, done_reason: "stop" });
  });
  assert.equal((await fetch(base + "/health")).status, 200);
  const response = await request({ ...payload, responseMimeType: "application/json" });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).provider, "ollama");
});
test("rechaza concurrencia mientras Ollama procesa una consulta", async t => {
  let release;
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  const { request } = await setup(t, () => new Promise(resolve => {
    release = () => resolve(Response.json({ message: { content: "Listo" } }));
    started();
  }));
  const first = request();
  await ready;
  assert.equal((await request()).status, 429);
  release();
  assert.equal((await first).status, 200);
});
test("error, respuesta vacía y truncada de Ollama se convierten en 502", async t => {
  for (const output of [new Response("", { status: 500 }), Response.json({ message: { content: "" } }), Response.json({ message: { content: "Parcial" }, done_reason: "length" })]) {
    const { request } = await setup(t, async () => output);
    assert.equal((await request()).status, 502);
  }
});
test("timeout se convierte en 504", async t => {
  const { request } = await setup(t, (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("abort")), { once: true });
  }), 30);
  assert.equal((await request()).status, 504);
});
