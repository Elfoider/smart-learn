"use client";
import { useEffect, useState } from "react";
import { onSnapshot, type DocumentData, type Query } from "firebase/firestore";
export type LiveDocument<T> = T & { id: string };
export function useLiveQuery<T = DocumentData>(queryRef: Query<DocumentData> | null) {
  const [snapshot, setSnapshot] = useState<{ source: Query<DocumentData>; data: LiveDocument<T>[]; error: string | null } | null>(null);
  useEffect(() => {
    if (!queryRef) return;
    return onSnapshot(queryRef, result => {
      setSnapshot({ source: queryRef, data: result.docs.map(item => ({ ...item.data(), id: item.id }) as LiveDocument<T>), error: null });
    }, () => {
      setSnapshot({ source: queryRef, data: [], error: "No se pudieron cargar los datos. Revisa tu sesión y vuelve a intentarlo." });
    });
  }, [queryRef]);
  const current = snapshot?.source === queryRef ? snapshot : null;
  return { data: current?.data || [], loading: !!queryRef && !current, error: current?.error || null };
}
