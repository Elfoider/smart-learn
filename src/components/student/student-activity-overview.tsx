"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import { useStudentEnrollments } from "@/components/student/live-courses";

type Grade = { studentId: string; courseId: string; status: string; assessmentTitle: string; normalizedPercentage: number; feedback: string };
type Attendance = { studentId: string; courseId: string; status: string; date: string };
type OnlineClass = { id: string; courseId: string; title: string; url: string; startsAt?: string; visibleToStudents?: boolean };
export function StudentActivityOverview({ mode }: { mode: "progress" | "calendar" }) {
  const { profile } = useAuth();
  const enrolled = useStudentEnrollments();
  const gradeRef = useMemo(() => profile && mode === "progress" ? query(collection(db, "grades"), where("studentId", "==", profile.uid), where("status", "==", "published")) : null, [profile, mode]);
  const attendanceRef = useMemo(() => profile && mode === "progress" ? query(collection(db, "attendance"), where("studentId", "==", profile.uid)) : null, [profile, mode]);
  const grades = useLiveQuery<Grade>(gradeRef);
  const attendance = useLiveQuery<Attendance>(attendanceRef);
  const [classes, setClasses] = useState<OnlineClass[]>([]);
  const [classError, setClassError] = useState(false);
  useEffect(() => {
    if (mode !== "calendar" || enrolled.loading || !profile) return;
    let active = true;
    const registered = enrolled.data.filter(e => e.status === "active");
    void Promise.all(registered.flatMap(e => [e.sectionId, null].map(section =>
      getDocs(query(collection(db, "onlineClasses"), where("courseId", "==", e.courseId), where("sectionId", "==", section), where("visibleToStudents", "==", true)))
    ))).then(groups => { if (active) setClasses(groups.flatMap(g => g.docs.map(d => ({ ...d.data(), id: d.id }) as unknown as OnlineClass))); })
      .catch(() => { if (active) setClassError(true); });
    return () => { active = false; };
  }, [mode, profile, enrolled.loading, enrolled.data]);
  const ids = new Set(enrolled.data.filter(e => e.status === "active").map(e => e.courseId));
  const mine = classes.filter(c => ids.has(c.courseId) && c.startsAt).sort((a, b) => (a.startsAt || "").localeCompare(b.startsAt || ""));
  const validUrl = (url: string) => { try { return ["https:", "http:"].includes(new URL(url).protocol); } catch {return false;} };
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><h1 className="text-3xl font-semibold">{mode === "progress" ? "Mi progreso" : "Calendario de clases"}</h1><p className="mt-2 text-white/70">Información publicada en tus materias inscritas.</p></header>
    {(enrolled.error || grades.error || attendance.error || classError) && <p role="alert">No fue posible cargar toda la información.</p>}
    {mode === "progress" ? <>
      <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Calificaciones publicadas</h2>{grades.data.filter(g => ids.has(g.courseId)).map(g => <article key={g.id} className="mt-3 rounded-xl border p-4"><strong>{g.assessmentTitle}</strong><p>{Number(g.normalizedPercentage).toFixed(1)}%</p>{g.feedback && <p className="text-sm text-muted-foreground">{g.feedback}</p>}</article>)}{!grades.data.length && <p className="mt-3">Todavía no tienes notas publicadas.</p>}</section>
      <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Asistencia</h2><p className="mt-3">{attendance.data.filter(a => a.status === "present").length} presentes de {attendance.data.length} registros</p></section>
      <Link href="/student/playground" className="inline-block rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950">Ir al playground</Link>
    </> : <section className="rounded-3xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Próximas clases</h2>{mine.filter(c => c.startsAt! >= new Date().toISOString().slice(0, 16)).map(c => <article key={c.id} className="mt-3 rounded-xl border p-4"><strong>{c.title}</strong><p>{c.startsAt?.replace("T", " ")}</p>{validUrl(c.url) && <a className="text-teal-600 underline" href={c.url} target="_blank" rel="noopener noreferrer">Entrar a la clase</a>}</article>)}{!mine.length && <p className="mt-3">No hay clases programadas.</p>}</section>}
  </div>;
}
