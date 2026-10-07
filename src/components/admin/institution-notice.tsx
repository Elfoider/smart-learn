"use client";
import { doc } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
// El aviso se integra en cada portal con un listener independiente y sin datos de acceso.
import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";
export function InstitutionNotice() {
    const { profile } = useAuth();
    const [notice, setNotice] = useState<{
        institutionName: string;
        announcement: string;
        academicPeriod: string;
    } | null>(null);
    useEffect(() => {
        if (!profile || profile.status !== "active")
            return;
        return onSnapshot(doc(db, "systemSettings", "general"), snap => { const d = snap.data(); setNotice(d ? { institutionName: String(d.institutionName || "Smart Learn"), announcement: String(d.announcement || ""), academicPeriod: String(d.academicPeriod || "") } : null); }, () => setNotice(null));
    }, [profile]);
    if (!profile || profile.status !== "active" || !notice)
        return null;
    return <div role="status" className="relative border-b border-primary/20 bg-primary/10 px-5 py-3 text-sm"><strong>{notice.institutionName} · {notice.academicPeriod}</strong>{notice.announcement && `: ${notice.announcement}`}</div>;
}
