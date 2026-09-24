"use client";

import { useEffect, useState } from "react";
import { onSnapshot, type DocumentData, type Query } from "firebase/firestore";

export type LiveDocument<T> = T & { id: string };

export function useLiveQuery<T = DocumentData>(queryRef: Query<DocumentData> | null) {
  const [data, setData] = useState<LiveDocument<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!queryRef) return;
    return onSnapshot(queryRef, snapshot => {
      setData(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as LiveDocument<T>));
      setLoading(false);
      setError(null);
    }, err => {
      console.error("Error al consultar Firestore:", err);
      setError("No se pudieron cargar los datos. Revisa tu sesión y las reglas de Firestore.");
      setLoading(false);
    });
  }, [queryRef]);
  return { data: queryRef ? data : [], loading: queryRef ? loading : false, error: queryRef ? error : null };
}
