export function getDailyAiLimit(value = process.env.AI_DAILY_LIMIT) {
  const number = Number(value ?? 50);
  return Number.isFinite(number) ? Math.max(1, Math.min(200, Math.trunc(number))) : 50;
}
