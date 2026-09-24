"use client";

import { useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, deleteDoc, doc, query, serverTimestamp, where } from "firebase/firestore";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";

type Resource = {
  teacherId: string; courseId: string; title: string; url: string;
  kind: string; unit?: string; visibleToStudents?: boolean; startsAt?: string;
};

export function AcademicResources({ kind }: { kind: "materials" | "onlineClasses" }) {
  const { profile } = useAuth();
  const { courses, sections } = useTeacherCourses();
  const [courseId, setCourseId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [unit, setUnit] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const ref = useMemo(() => profile ? query(collection(db, kind), where("teacherId", "==", profile.uid)) : null, [kind, profile]);
  const { data, loading, error } = useLiveQuery<Resource>(ref);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile || !courses.some(c => c.id === courseId)) return;
    let safeUrl: URL;
    try {
      safeUrl = new URL(url);
      if (!["https:", "http:"].includes(safeUrl.protocol)) throw new Error();
    } catch { toast.error("Introduce un enlace HTTP o HTTPS válido."); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, kind), {
        teacherId: profile.uid, courseId, sectionId: sectionId || null,
        title: title.trim(), url: safeUrl.href, kind: kind === "materials" ? "link" : "live",
        unit: unit.trim(), startsAt: startsAt || null,
        visibleToStudents: visible, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      setTitle(""); setUrl(""); setUnit(""); setStartsAt("");
      toast.success("Recurso publicado");
    } catch { toast.error("No fue posible guardar el recurso."); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <header className="rounded-3xl bg-[#071a22] p-8 text-white">
      <p className="text-sm text-teal-300">Gestión académica</p>
      <h1 className="mt-2 text-3xl font-semibold">{kind === "materials" ? "Materiales de estudio" : "Clases en línea"}</h1>
      <p className="mt-2 text-white/70">Publica enlaces para las materias a tu cargo.</p>
    </header>
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
      <select aria-label="Materia" required className="rounded-xl border p-3 text-foreground" value={courseId} onChange={e => {setCourseId(e.target.value); setSectionId("");}}>
        <option value="">Selecciona materia</option>{courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select aria-label="Sección" className="rounded-xl border p-3 text-foreground" value={sectionId} onChange={e => setSectionId(e.target.value)}>
        <option value="">Todas las secciones</option>{sections.filter(s => s.courseId === courseId).map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
      </select>
      <input required maxLength={180} className="rounded-xl border p-3 text-foreground" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
      <input required type="url" className="rounded-xl border p-3 text-foreground" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
      {kind === "onlineClasses" ? <label className="text-sm">Fecha y hora<input type="datetime-local" className="mt-1 w-full rounded-xl border p-3 text-foreground" value={startsAt} onChange={e => setStartsAt(e.target.value)} /></label>
        : <input className="rounded-xl border p-3 text-foreground" placeholder="Unidad o tema" value={unit} onChange={e => setUnit(e.target.value)} />}
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} />Visible para estudiantes</label>
      <button disabled={saving} className="rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">Publicar</button>
    </form>
    {loading && <p>Cargando recursos…</p>}{error && <p role="alert">{error}</p>}
    <div className="grid gap-3">{data.map(item => <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
      <div><strong>{item.title}</strong><p className="text-sm text-muted-foreground">{courses.find(c => c.id === item.courseId)?.name} · {item.visibleToStudents ? "Publicado" : "Oculto"}</p>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 underline">Abrir enlace</a></div>
      <button className="rounded-xl border px-4 py-2 text-sm" onClick={async () => { if (!confirm("¿Eliminar este recurso?")) return; try {await deleteDoc(doc(db, kind, item.id));} catch {toast.error("No se pudo eliminar.");} }}>Eliminar</button>
    </article>)}</div>
  </div>;
}
