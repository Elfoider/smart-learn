import { GoogleGenAI } from "@google/genai";

export function getAiConfig() {
  const provider = process.env.AI_PROVIDER?.trim() || "gemini";
  if (provider !== "gemini" && provider !== "ollama") throw new Error("ai/invalid-provider");
  return {
    provider,
    model: provider === "ollama"
      ? process.env.OLLAMA_MODEL?.trim() || "qwen2.5:3b"
      : process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite",
  } as { provider: "gemini" | "ollama"; model: string };
}

export function isAiConfigured() {
  const { provider } = getAiConfig();
  return provider === "ollama"
    ? Boolean(process.env.LOCAL_AI_URL?.trim() && process.env.LOCAL_AI_TOKEN?.trim())
    : Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function generateAcademicText(input: {
  systemInstruction: string;
  contents: string;
  maxOutputTokens: number;
  responseMimeType?: string;
}) {
  const { provider, model } = getAiConfig();
  if (!isAiConfigured()) throw new Error(`${provider}/missing-config`);
  let text: string | undefined;
  if (provider === "ollama") {
    const url = new URL(process.env.LOCAL_AI_URL!.trim());
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
      throw new Error("ollama/https-required");
    }
    if (url.username || url.password || url.search || url.hash) throw new Error("ollama/invalid-url");
    const configuredTimeout = Number(process.env.LOCAL_AI_TIMEOUT_MS || 60000);
    const timeout = Number.isFinite(configuredTimeout) ? Math.max(1000, Math.min(120000, configuredTimeout)) : 60000;
    const response = await fetch(new URL("/v1/generate", url), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.LOCAL_AI_TOKEN!.trim()}` },
      body: JSON.stringify({ ...input, model }),
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new Error(`ollama/gateway-${response.status}`);
    const result: unknown = await response.json();
    if (result && typeof result === "object" && "text" in result && typeof result.text === "string") text = result.text;
  } else {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
    const response = await ai.models.generateContent({
      model,
      contents: input.contents,
      config: { systemInstruction: input.systemInstruction, maxOutputTokens: input.maxOutputTokens, responseMimeType: input.responseMimeType },
    });
    text = response.text;
  }
  if (!text?.trim()) throw new Error(`${provider}/empty-response`);
  return { text: text.trim(), provider, model };
}
