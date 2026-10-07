// El plazo depende del inicio guardado por el servidor, no del contador del navegador.
export function remainingExamSeconds(startedAtMs: number, durationSeconds: number, nowMs = Date.now()) {
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) return 0;
  return Math.max(0, Math.min(durationSeconds, Math.ceil((startedAtMs + durationSeconds * 1000 - nowMs) / 1000)));
}
