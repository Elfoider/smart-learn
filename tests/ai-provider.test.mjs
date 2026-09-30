import test from "node:test";
import assert from "node:assert/strict";
import { generateAcademicText } from "../src/lib/ai/generation.ts";

const input = { systemInstruction: "Tutor", contents: "Pregunta", maxOutputTokens: 300 };
function setup(t) {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  t.after(() => { process.env = saved; globalThis.fetch = originalFetch; });
  process.env.AI_PROVIDER = "ollama";
  process.env.LOCAL_AI_URL = "https://test.example";
  process.env.LOCAL_AI_TOKEN = "secret";
  process.env.OLLAMA_MODEL = "qwen2.5:3b";
}
test("Ollama usa solo el gateway autenticado, incluso con clave Gemini presente", async t => {
  setup(t);
  process.env.GEMINI_API_KEY = "must-not-be-used";
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://test.example/v1/generate");
    assert.equal(init.headers.Authorization, "Bearer secret");
    assert.equal(JSON.parse(init.body).model, "qwen2.5:3b");
    assert.equal(init.redirect, "error");
    return Response.json({ text: "Respuesta local" });
  };
  assert.deepEqual(await generateAcademicText(input), { text: "Respuesta local", provider: "ollama", model: "qwen2.5:3b" });
});
test("fallo del gateway se propaga sin consultar Gemini", async t => {
  setup(t);
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response("", { status: 504 }); };
  await assert.rejects(generateAcademicText(input), /ollama\/gateway-504/);
  assert.equal(calls, 1);
});
test("rechaza configuración ausente y URL remota sin HTTPS", async t => {
  setup(t);
  delete process.env.LOCAL_AI_TOKEN;
  await assert.rejects(generateAcademicText(input), /missing-config/);
  process.env.LOCAL_AI_TOKEN = "secret";
  process.env.LOCAL_AI_URL = "http://test.example";
  await assert.rejects(generateAcademicText(input), /https-required/);
});
