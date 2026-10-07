"use client";
import { useEffect, useState } from "react";

// El reloj se actualiza fuera del render y parte de un valor compatible con SSR.
export function useMinuteClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const initial = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, []);
  return now;
}
