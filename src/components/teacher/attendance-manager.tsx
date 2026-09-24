"use client";

import { useMemo, useState } from "react";
import { collection, doc, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherStudents } from "@/hooks/use-teacher-students";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";

type Attendance = { teacherId: string; courseId: string; sectionId: string; studentId: string; date: string; status: string };

export function AttendanceManager() {
  const { profile } = useAuth();
  const { courses, sections } = useTeacherCourses();
  const { enrollments, loading: enrollmentsLoading } = useTeacherStudents();
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const ref = useMemo(() => profile ? query(collection(db, "attendance"), where("teacherId", "==", profile.uid)) : null, [profile]);
  const { data, loading, error } = useLiveQuery<Attendance>(ref);
  const students = enrollments.filter(e => e.status === "active" && e.courseId === courseId && e.sectionId === sectionId);
  async function mark(studentId: string, status: string) {
    if (!profile || !courseId || !sectionId || !date || !students.some(s => s.studentId === studentId)) return;
    try {
      await setDoc(doc(db, "attendance", [courseId, sectionId, date, studentId].join("--")), {
        teacherId: profile.uid, courseId, sectionId, studentId, date, status, updatedAt: serverTimestamp()
      });
      toast.success("Asistencia guardada");
    } catch { toast.error("No fue posible guardar la asistencia."); }
  }
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><h1 className="text-3xl font-semibold">Asistencia</h1><p className="mt-2 text-white/70">Marca cada estudiante por fecha y sección.</p></header>
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
      <select aria-label="Materia" value={courseId} onChange={e => {setCourseId(e.target.value);setSectionId("");}} className="rounded-xl border p-3"><option value="">Materia</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <select aria-label="Sección" value={sectionId} onChange={e => setSectionId(e.target.value)} className="rounded-xl border p-3"><option value="">Sección</option>{sections.filter(s => s.courseId === courseId).map(s => <option key={s.id} value={s.id}>{s.code}</option>)}</select>
      <input aria-label="Fecha" type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl border p-3" />
    </div>
    {(loading || enrollmentsLoading) && <p>Cargando estudiantes…</p>}{error && <p role="alert">{error}</p>}
    {sectionId && !students.length && !enrollmentsLoading && <p>No hay estudiantes activos en esta sección.</p>}
    {students.map(s => {
      const current = data.find(a => a.studentId === s.studentId && a.courseId === courseId && a.sectionId === sectionId && a.date === date);
      return <article key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div><strong>{s.studentName}</strong><p className="text-sm text-muted-foreground">{s.studentEmail} · {current?.status || "Sin registrar"}</p></div>
        <div className="flex flex-wrap gap-2">{(["present", "absent", "excused"] as const).map((value, i) => <button key={value} type="button" aria-pressed={current?.status === value} onClick={() => void mark(s.studentId, value)} className="rounded-xl border px-3 py-2 text-sm aria-pressed:bg-teal-500 aria-pressed:text-slate-950">{["Presente", "Ausente", "Justificado"][i]}</button>)}</div>
      </article>;
    })}
  </div>;
}
