"use client";
import { useCallback, useSyncExternalStore } from "react";
const memory = new Map<string, boolean>();
const event = "smart-learn-preference";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(event, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(event, callback); };
}
// Only display preferences; no academic or personal data is stored here.
export function usePortalPreference(key: string, fallback: boolean) {
  const read = useCallback(() => {
    if (memory.has(key)) return memory.get(key)!;
    try { const value = localStorage.getItem(key); return value === null ? fallback : value === "true"; }
    catch { return fallback; }
  }, [key, fallback]);
  const value = useSyncExternalStore(subscribe, read, () => fallback);
  const set = (next: boolean) => {
    try { localStorage.setItem(key, String(next)); memory.delete(key); }
    catch { memory.set(key, next); }
    window.dispatchEvent(new Event(event));
  };
  return [value, set] as const;
}
