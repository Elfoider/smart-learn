"use client";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
export function InstitutionNotice({ compact = false }: { compact?: boolean }) {
  const { profile } = useAuth();
  const panel = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<{ institutionName: string; announcement: string; academicPeriod: string } | null>(null);
  useEffect(() => {
    if (!profile || profile.status !== "active") return;
    return onSnapshot(doc(db, "systemSettings", "general"), snap => {
      const d = snap.data();
      setNotice(d ? { institutionName: String(d.institutionName || "Smart Learn"), announcement: String(d.announcement || ""), academicPeriod: String(d.academicPeriod || "") } : null);
    }, () => setNotice(null));
  }, [profile]);
  if (!profile || profile.status !== "active") return null;
  const content = <><p className="font-semibold">{notice?.institutionName || "Smart Learn"}</p>{notice?.academicPeriod && <p className="mt-1 text-xs text-muted-foreground">{notice.academicPeriod}</p>}<p className="mt-4 whitespace-pre-wrap text-sm leading-6">{notice?.announcement || "No hay avisos institucionales publicados."}</p></>;
  if (!compact) return notice ? <details className="rounded-xl border border-border p-3"><summary className="cursor-pointer text-sm">Aviso institucional</summary><div className="mt-3">{content}</div></details> : null;
  return <>
    <button className="portal-icon relative" aria-label="Ver avisos institucionales" title="Avisos institucionales" onClick={() => panel.current?.showModal()}><Bell className="h-4 w-4" />{notice?.announcement && <span aria-hidden="true" className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />}</button>
    <dialog ref={panel} className="portal-dialog" aria-labelledby="institution-title"><div className="mb-4 flex items-center justify-between"><h2 id="institution-title" className="text-lg font-semibold">Avisos institucionales</h2><button className="portal-icon" aria-label="Cerrar avisos" onClick={() => panel.current?.close()}><X className="h-5 w-5" /></button></div>{content}</dialog>
  </>;
}
