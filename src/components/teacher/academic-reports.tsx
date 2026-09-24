"use client";

import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { useTeacherStudents } from "@/hooks/use-teacher-students";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import type { TeacherGrade } from "@/types/teacher-grade";

type Attendance = { teacherId: string; courseId: string; studentId: string; status: string };
export function AcademicReports() {
  const { profile } = useAuth();
  const { courses } = useTeacherCourses();
  const { enrollments } = useTeacherStudents();
  const gradesRef = useMemo(() => profile ? query(collection(db, "grades"), where("teacherId", "==", profile.uid)) : null, [profile]);
  const attendanceRef = useMemo(() => profile ? query(collection(db, "attendance"), where("teacherId", "==", profile.uid)) : null, [profile]);
  const grades = useLiveQuery<TeacherGrade>(gradesRef);
  const attendance = useLiveQuery<Attendance>(attendanceRef);
  const rows = courses.map(course => {
    const students = enrollments.filter(e => e.courseId === course.id && e.status === "active");
    const published = grades.data.filter(g => g.courseId === course.id && g.status === "published");
    const present = attendance.data.filter(a => a.courseId === course.id && a.status === "present").length;
    const total = attendance.data.filter(a => a.courseId === course.id).length;
    return { course: course.name, students: students.length,
      mean: published.length ? (published.reduce((sum, g) => sum + (Number(g.normalizedPercentage) || 0), 0) / published.length).toFixed(1) + "%" : "Sin notas",
      attendance: total ? Math.round(present / total * 100) + "%" : "Sin registros" };
  });
  function downloadCsv() {
    const csv = ["Materia,Estudiantes,Promedio publicado,Asistencia", ...rows.map(row => [row.course, row.students, row.mean, row.attendance].map(v => '"' + String(v).replaceAll('"', '""') + '"').join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "smart-learn-reporte.csv"; a.click();
    URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white"><h1 className="text-3xl font-semibold">Reportes académicos</h1><p className="mt-2 text-white/70">Resumen de notas publicadas y asistencia registrada.</p></header>
    {(grades.loading || attendance.loading) && <p>Cargando reportes…</p>}
    {(grades.error || attendance.error) && <p role="alert">{grades.error || attendance.error}</p>}
    <button onClick={downloadCsv} disabled={!rows.length} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">Exportar CSV</button>
    <div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-sm"><thead className="bg-secondary"><tr>{["Materia","Estudiantes","Promedio publicado","Asistencia"].map(h => <th className="p-4" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.course} className="border-t border-border"><td className="p-4">{row.course}</td><td className="p-4">{row.students}</td><td className="p-4">{row.mean}</td><td className="p-4">{row.attendance}</td></tr>)}</tbody></table></div>
  </div>;
}
