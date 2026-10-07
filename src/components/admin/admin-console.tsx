"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ShieldCheck, Users, BookOpen, Layers, GraduationCap, NotebookPen, ClipboardCheck, FolderOpen, Video, ChartColumn, CalendarCheck, Settings, History, Bot, LayoutDashboard, LogOut, Plus, RefreshCw, Download, ChevronRight, X, Search } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { adminModules, adminLabels, type AdminRecord, type AdminResource, type AdminField } from "@/lib/admin/catalog";
import { InstitutionNotice } from "@/components/admin/institution-notice";
import { adminCsv } from "@/lib/admin/csv";
type Module = AdminResource | "summary" | "reports" | "adminAudit" | "aiLogs";
const navigation = [{ id: "summary", label: "Resumen", icon: LayoutDashboard }, { id: "users", label: "Usuarios", icon: Users }, { id: "courses", label: "Materias", icon: BookOpen }, { id: "sections", label: "Secciones", icon: Layers }, { id: "enrollments", label: "Matrículas", icon: GraduationCap }, { id: "lessonPlans", label: "Clases y planificación", icon: NotebookPen }, { id: "materials", label: "Materiales", icon: FolderOpen }, { id: "onlineClasses", label: "Encuentros en línea", icon: Video }, { id: "assessments", label: "Evaluaciones y rúbricas", icon: ClipboardCheck }, { id: "grades", label: "Calificaciones", icon: ChartColumn }, { id: "attendance", label: "Asistencia", icon: CalendarCheck }, { id: "reports", label: "Reportes", icon: ChartColumn }, { id: "aiLogs", label: "Actividad de IA", icon: Bot }, { id: "adminAudit", label: "Auditoría", icon: History }, { id: "settings", label: "Configuración", icon: Settings }] as const;
const fieldClass = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50";
const labelFor = (value: unknown) => adminLabels[String(value)] || String(value ?? "");
function download(name: string, records: Record<string, unknown>[]) { const url = URL.createObjectURL(new Blob([adminCsv(records)], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
function defaults(module: AdminResource, record: AdminRecord | null) { return Object.fromEntries(adminModules[module].fields.map(f => [f.key, record?.[f.key] ?? f.default ?? (f.type === "boolean" ? false : f.type === "number" ? 0 : f.type === "lines" || f.type === "rubric" ? [] : "")])); }
export function AdminConsole() {
    const { user, profile, signOut } = useAuth();
    const [module, setModule] = useState<Module>("summary");
    const [records, setRecords] = useState<AdminRecord[]>([]);
    const [summary, setSummary] = useState<{
        counts: Record<string, number>;
        ai: {
            provider: string;
            model: string;
            gatewayConfigured: boolean;
            fallbackEnabled: boolean;
        };
        database: string;
    } | null>(null);
    const [references, setReferences] = useState<Record<string, AdminRecord[]>>({});
    const [cursor, setCursor] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const [editing, setEditing] = useState<AdminRecord | null | undefined>(undefined);
    const [values, setValues] = useState<Record<string, unknown>>({});
    const [email, setEmail] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const request = useCallback(async (path: string, body?: unknown, signal?: AbortSignal) => {
        if (!user)
            throw new Error("Inicia sesión nuevamente.");
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, signal });
        const result = await response.json();
        if (!response.ok)
            throw new Error(result.error || "No se pudo completar la solicitud.");
        return result;
    }, [user]);
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            setError(null);
            void (async () => {
                try {
                    if (module === "summary") {
                        setSummary(await request("?resource=summary", undefined, controller.signal));
                        setRecords([]);
                        setNextCursor(null);
                    }
                    else {
                        const result = await request(`?resource=${module}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, undefined, controller.signal);
                        setRecords(result.records);
                        setNextCursor(result.nextCursor);
                    }
                }
                catch (e) {
                    if (!controller.signal.aborted) {
                        setRecords([]);
                        setError(e instanceof Error ? e.message : "Error al cargar.");
                    }
                }
                finally {
                    if (!controller.signal.aborted)
                        setLoading(false);
                }
            })();
        }, 0);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [request, module, cursor, revision]);
    useEffect(() => {
        const controller = new AbortController();
        void Promise.all(["users", "courses", "sections", "assessments"].map(async (name) => {
            const all: AdminRecord[] = [];
            let next: string | null = null;
            do {
                const result = await request(`?resource=${name}${next ? `&cursor=${encodeURIComponent(next)}` : ""}`, undefined, controller.signal);
                all.push(...result.records);
                next = result.nextCursor;
            } while (next && all.length < 1000);
            return [name, all] as const;
        })).then(entries => { if (!controller.signal.aborted)
            setReferences(Object.fromEntries(entries)); }).catch(() => { if (!controller.signal.aborted)
            toast.error("No se cargaron los selectores. Pulsa Actualizar para reintentar."); });
        return () => controller.abort();
    }, [request, revision]);
    useEffect(() => {
        if (editing !== undefined) {
            dialogRef.current?.showModal();
        }
        else
            dialogRef.current?.close();
    }, [editing]);
    function navigate(next: Module) { setModule(next); setCursor(null); setNextCursor(null); setSearch(""); setCourseFilter(""); setRecords([]); setEditing(undefined); }
    function open(record: AdminRecord | null) {
        if (!(module in adminModules))
            return;
        setValues(defaults(module as AdminResource, record));
        setEmail("");
        setReason("");
        setEditing(record);
    }
    function patch(key: string, value: unknown) { setValues(v => ({ ...v, [key]: value, ...(key === "courseId" ? { ...("sectionId" in v ? { sectionId: null } : {}), ...("assessmentId" in v ? { assessmentId: "" } : {}) } : {}) })); }
    async function save(event: FormEvent) {
        event.preventDefault();
        if (!(module in adminModules) || saving)
            return;
        setSaving(true);
        try {
            const data = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) && v.every(item => typeof item === "string") ? v.map(item => item.trim()).filter(Boolean) : v === "" && ["sectionId", "startsAt"].includes(k) ? null : v]));
            if (module === "users" && !editing)
                await request("", { action: "create-user", email, name: data.name, role: data.role, reason });
            else
                await request("", { action: "save", resource: module, id: editing?.id || null, data, reason });
            toast.success(module === "users" && !editing ? "Perfil creado. El usuario puede establecer su contraseña desde el enlace de recuperación en Login." : "Cambios guardados y registrados en auditoría.");
            setEditing(undefined);
            setRevision(v => v + 1);
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "No fue posible guardar.");
        }
        finally {
            setSaving(false);
        }
    }
    const description = module in adminModules ? adminModules[module as AdminResource].description : module === "summary" ? "Supervisa el acceso, la oferta académica y la actividad de la plataforma." : module === "reports" ? "Indicadores por materia calculados sobre notas publicadas y asistencia registrada." : module === "aiLogs" ? "Registro de consultas admitidas y proveedor, sin guardar conversaciones ni claves." : "Consulta quién realizó cada cambio y su motivo.";
    const filtered = records.filter(r => (!courseFilter || r.courseId === courseFilter) && JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
    const lookup = (collection: string, id: unknown) => { const r = references[collection]?.find(r => r.id === id); return r ? String(r.name || r.title || r.code || r.id) : String(id || "Todas las secciones"); };
    const title = navigation.find(n => n.id === module)?.label || "Administración";
    const resource = module in adminModules ? module as AdminResource : null;
    return <div className="min-h-screen bg-background">
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex items-center gap-3 border-b border-border p-6"><ShieldCheck className="h-9 w-9 text-primary"/><div><p className="font-bold">Smart Learn</p><p className="text-xs text-muted-foreground">Administración institucional</p></div></div>
      <nav aria-label="Módulos administrativos" className="flex-1 space-y-1 overflow-y-auto p-3">{navigation.map(n => <button key={n.id} onClick={() => navigate(n.id)} aria-current={module === n.id ? "page" : undefined} className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm ${module === n.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}><n.icon className="h-4 w-4"/>{n.label}</button>)}</nav>
      <div className="border-t border-border p-4"><p className="mb-3 truncate text-sm font-medium">{profile?.name}</p><button className={buttonClass + " w-full"} onClick={() => void signOut().catch(() => toast.error("No se pudo cerrar sesión."))}><LogOut className="h-4 w-4"/>Cerrar sesión</button></div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Portal administrador</p><p className="text-sm text-muted-foreground">Smart Learn · Gestión integral</p></div><div className="flex items-center gap-2"><ThemeToggle /><button className={buttonClass + " lg:hidden"} aria-label="Cerrar sesión" onClick={() => void signOut().catch(() => toast.error("No se pudo cerrar sesión."))}><LogOut className="h-4 w-4"/></button></div></header>
      <InstitutionNotice />
      <nav aria-label="Módulos en móvil" className="border-b border-border p-4 lg:hidden"><select aria-label="Seleccionar módulo" className={fieldClass} value={module} onChange={e => navigate(e.target.value as Module)}>{navigation.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></nav>
      <main className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div><div className="flex gap-2"><button disabled={loading || saving} className={buttonClass} onClick={() => setRevision(v => v + 1)}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/>Actualizar</button>{resource && resource !== "settings" && <button className={buttonClass + " bg-primary text-primary-foreground"} onClick={() => open(null)}><Plus className="h-4 w-4"/>Crear</button>}</div></div>
        {error && <p role="alert" className="rounded-2xl border border-danger/40 p-4 text-sm text-danger">{error}</p>}
        {loading ? <p role="status" className="rounded-2xl border border-border p-6 text-muted-foreground">Cargando información…</p> : module === "summary" && summary ? <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["users", "Usuarios registrados"], ["courses", "Materias"], ["enrollments", "Matrículas registradas"], ["assessments", "Evaluaciones"]].map(([key, label]) => <button key={key} onClick={() => navigate(key as Module)} className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-4xl font-semibold">{summary.counts[key]}</p><p className="mt-3 flex items-center gap-1 text-xs text-primary">Gestionar<ChevronRight className="h-3 w-3"/></p></button>)}</section>
          <section className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Actividad académica</h2><dl className="mt-4 grid grid-cols-2 gap-4">{["sections", "lessonPlans", "materials", "onlineClasses", "grades", "attendance"].map(k => <div key={k}><dt className="text-xs text-muted-foreground">{adminModules[k as AdminResource].label}</dt><dd className="mt-1 text-xl font-semibold">{summary.counts[k]}</dd></div>)}</dl><p className="mt-5 text-xs text-muted-foreground">Totales de documentos, incluidos registros históricos. Usa cada módulo para revisar su estado.</p></div><div className="rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Asistencia de IA</h2><dl className="mt-4 space-y-3 text-sm"><div>Proveedor configurado: <strong>{summary.ai.provider}</strong></div><div>Modelo: <strong>{summary.ai.model || "Configurado en servidor"}</strong></div><div>Gateway: <strong>{summary.ai.gatewayConfigured ? "Configuración presente" : "Revisar configuración"}</strong></div></dl><p className="mt-4 text-xs leading-5 text-muted-foreground">La presencia de configuración no demuestra disponibilidad. Realiza una consulta desde una materia para comprobar la conexión.</p><button className={buttonClass + " mt-5"} onClick={() => navigate("aiLogs")}>Ver actividad</button></div></section>
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6"><h2 className="font-semibold">Comienza por el acceso y la oferta académica</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Registra docentes y estudiantes, asigna las materias, crea sus secciones y matricula a los estudiantes. Publica después las clases, materiales y evaluaciones.</p></section>
        </> : module === "reports" ? <ReportView records={records} onDownload={download}/> : <>
          {resource === "settings" ? <div className="rounded-2xl border border-border bg-card p-6"><dl className="grid gap-4 md:grid-cols-2">{adminModules.settings.fields.map(f => <div key={f.key}><dt className="text-sm text-muted-foreground">{f.label}</dt><dd className="mt-1 whitespace-pre-wrap font-medium">{String(records[0]?.[f.key] || "Sin configurar")}</dd></div>)}</dl><button className={buttonClass + " mt-6"} onClick={() => open(records[0] || null)}>Editar configuración</button></div> : <>
            <div className="flex flex-wrap gap-3"><label className="relative min-w-48 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input className={fieldClass + " pl-9"} aria-label="Buscar en esta página" placeholder="Buscar en esta página" value={search} onChange={e => setSearch(e.target.value)}/></label>{module !== "users" && resource && <select className={fieldClass + " max-w-xs"} aria-label="Filtrar materia en esta página" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}><option value="">Todas las materias de esta página</option>{references.courses?.map(r => <option key={r.id} value={r.id}>{String(r.name)}</option>)}</select>}<button disabled={!filtered.length} className={buttonClass} onClick={() => download(`smart-learn-${module}-pagina.csv`, filtered)}><Download className="h-4 w-4"/>Exportar página</button></div>
            <p className="text-xs text-muted-foreground">{filtered.length} registros visibles. La búsqueda y exportación corresponden a esta página, de hasta 50 registros.</p>
            <div className="space-y-3">{filtered.map(record => <article key={record.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words font-semibold">{String(record.name || record.title || record.assessmentTitle || record.studentName || record.reason || record.feature || record.id)}</h2><p className="mt-1 break-all text-xs text-muted-foreground">{module === "users" ? `${record.email} · ${labelFor(record.role)}` : record.courseId ? lookup("courses", record.courseId) : module === "adminAudit" ? `Responsable: ${lookup("users", record.actorId)} · ${adminModules[record.resource as AdminResource]?.label || record.resource}` : record.userId ? `Usuario: ${lookup("users", record.userId)}` : ""}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{record.status != null && <span className="rounded-lg bg-secondary px-2 py-1">{labelFor(record.status)}</span>}{record.visibleToStudents != null && <span className="rounded-lg bg-primary/10 px-2 py-1 text-primary">{record.visibleToStudents ? "Publicado para estudiantes" : "Oculto"}</span>}{record.score != null && <span className="rounded-lg bg-secondary px-2 py-1">{String(record.score)} / {String(record.maxScore)}</span>}{record.date != null && <span className="rounded-lg bg-secondary px-2 py-1">{String(record.date)}</span>}{record.sectionId != null && <span className="rounded-lg bg-secondary px-2 py-1">Sección: {lookup("sections", record.sectionId)}</span>}{record.provider != null && <span className="rounded-lg bg-secondary px-2 py-1">{String(record.provider)} · {String(record.model || record.outcome || "")}</span>}</div></div>{resource && <button className={buttonClass} onClick={() => open(record)}>Editar</button>}</div>
              <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">{module === "adminAudit" ? "Ver cambios registrados" : "Ver ficha completa"}</summary><dl className="mt-3 grid gap-2">{Object.entries(record).map(([k, v]) => <div key={k} className="break-words"><dt className="font-medium">{adminModules[resource!]?.fields.find(f => f.key === k)?.label || ({ createdAt: "Fecha de registro", updatedAt: "Última actualización", reason: "Motivo", before: "Antes", after: "Después", id: "Identificador", recordId: "Registro afectado" } as Record<string, string>)[k] || k}</dt><dd className="mt-1 whitespace-pre-wrap">{typeof v === "object" ? JSON.stringify(v, null, 2) : labelFor(v)}</dd></div>)}</dl></details>
            </article>)}</div>{!filtered.length && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No hay registros que mostrar.</p>}
            <div className="flex gap-3"><button className={buttonClass} disabled={!cursor} onClick={() => setCursor(null)}>Primera página</button><button className={buttonClass} disabled={!nextCursor} onClick={() => setCursor(nextCursor)}>Siguiente página<ChevronRight className="h-4 w-4"/></button></div>
          </>}
        </>}
      </main>
    </div>
    <dialog ref={dialogRef} onCancel={e => { if (saving)
        e.preventDefault();
    else
        setEditing(undefined); }} className="m-auto max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/60">
      {resource && editing !== undefined && <form onSubmit={save}><header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-5"><h2 className="text-xl font-semibold">{editing ? "Editar" : "Crear"} · {title}</h2><button type="button" className={buttonClass} disabled={saving} aria-label="Cerrar formulario" onClick={() => setEditing(undefined)}><X className="h-4 w-4"/></button></header><div className="grid gap-5 p-5 sm:grid-cols-2">{resource === "users" && !editing && <label className="sm:col-span-2 text-sm">Correo electrónico<input type="email" required maxLength={254} className={fieldClass + " mt-2"} value={email} onChange={e => setEmail(e.target.value)}/><span className="mt-1 block text-xs text-muted-foreground">Se crea o vincula una cuenta de Firebase. El usuario establece su contraseña desde Recuperar contraseña en Login.</span></label>}
      {adminModules[resource].fields.filter(f => !(resource === "users" && !editing && f.key === "status")).map(f => <FieldEditor key={f.key} field={f} value={values[f.key]} values={values} references={references} locked={Boolean(editing) && ["courseId", "studentId", "assessmentId", "date"].includes(f.key)} onChange={v => patch(f.key, v)}/>)}
      <label className="text-sm sm:col-span-2">Motivo del cambio<textarea required minLength={8} maxLength={500} className={fieldClass + " mt-2"} rows={2} placeholder="Explica por qué se crea o modifica este registro." value={reason} onChange={e => setReason(e.target.value)}/></label></div><footer className="flex justify-end gap-3 border-t border-border p-5"><button type="button" disabled={saving} className={buttonClass} onClick={() => setEditing(undefined)}>Cancelar</button><button disabled={saving} className={buttonClass + " bg-primary text-primary-foreground"}>{saving ? "Guardando…" : "Guardar cambios"}</button></footer></form>}
    </dialog>
  </div>;
}
function FieldEditor({ field: f, value, values, references, locked, onChange }: {
    field: AdminField;
    value: unknown;
    values: Record<string, unknown>;
    references: Record<string, AdminRecord[]>;
    locked: boolean;
    onChange: (v: unknown) => void;
}) {
    if (f.type === "boolean")
        return <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)}/>{f.label}</label>;
    if (f.type === "rubric") {
        const rows = (Array.isArray(value) ? value : []) as {
            id: string;
            title: string;
            description: string;
            points: number;
        }[];
        return <fieldset className="space-y-3 sm:col-span-2"><legend className="text-sm font-medium">{f.label}</legend>{rows.map((r, i) => <div key={r.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1fr_100px_auto]"><input aria-label={`Criterio ${i + 1}`} placeholder="Criterio" required className={fieldClass} value={r.title} onChange={e => onChange(rows.map((r, j) => j === i ? { ...r, title: e.target.value } : r))}/><input aria-label={`Descripción ${i + 1}`} placeholder="Descripción" className={fieldClass} value={r.description} onChange={e => onChange(rows.map((r, j) => j === i ? { ...r, description: e.target.value } : r))}/><input aria-label={`Puntos ${i + 1}`} type="number" min={0} step="0.01" required className={fieldClass} value={r.points} onChange={e => onChange(rows.map((r, j) => j === i ? { ...r, points: Number(e.target.value) } : r))}/><button type="button" className={buttonClass} aria-label={`Eliminar criterio ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}><X className="h-4 w-4"/></button></div>)}<button type="button" disabled={rows.length >= 20} className={buttonClass} onClick={() => onChange([...rows, { id: crypto.randomUUID(), title: "", description: "", points: 0 }])}><Plus className="h-4 w-4"/>Añadir criterio</button></fieldset>;
    }
    const reference = f.reference ? references[f.reference] || [] : [];
    const options = reference.filter(r => (!f.role || r.role === f.role) && (f.reference !== "sections" && f.reference !== "assessments" || !values.courseId || r.courseId === values.courseId));
    const wide = f.type === "textarea" || f.type === "lines";
    return <label className={`text-sm ${wide ? "sm:col-span-2" : ""}`}>{f.label}{f.required && " *"}{f.reference ? <><select aria-label={`${f.label}${f.required ? " *" : ""}`} required={f.required} disabled={locked} className={fieldClass + " mt-2"} value={String(value || "")} onChange={e => onChange(e.target.value || null)}><option value="">{f.required ? "Selecciona una opción" : "Todas las secciones"}</option>{options.map(r => <option key={r.id} value={r.id}>{String(r.name || r.title || r.code || r.id)}{r.email ? ` · ${r.email}` : ""}{r.status && r.status !== "active" ? ` (${labelFor(r.status)})` : ""}</option>)}{Boolean(value) && !options.some(r => r.id === value) && <option value={String(value)}>{String(value)} (referencia actual)</option>}</select>{locked && <span className="mt-1 block text-xs text-muted-foreground">La identidad del registro se conserva.</span>}</> : f.type === "select" ? <select aria-label={f.label} className={fieldClass + " mt-2"} value={String(value || "")} onChange={e => onChange(e.target.value)}>{f.options?.map(v => <option key={v} value={v}>{labelFor(v)}</option>)}</select> : wide ? <textarea className={fieldClass + " mt-2"} rows={f.key === "lessonContent" ? 8 : 3} maxLength={f.key === "lessonContent" ? 30000 : 12000} value={f.type === "lines" ? (Array.isArray(value) ? value.join("\n") : "") : String(value || "")} onChange={e => onChange(f.type === "lines" ? e.target.value.split("\n") : e.target.value)}/> : <input disabled={locked} required={f.required} type={f.type || "text"} step={f.type === "number" ? (["score", "maxScore", "passingScore", "weightPercentage"].includes(f.key) ? "0.01" : "1") : undefined} min={f.type === "number" ? 0 : undefined} className={fieldClass + " mt-2"} value={f.type === "number" ? Number(value || 0) : String(value || "").slice(0, f.type === "date" ? 10 : f.type === "datetime-local" ? 16 : undefined)} onChange={e => onChange(f.type === "number" ? Number(e.target.value) : e.target.value)}/>}</label>;
}
function ReportView({ records, onDownload }: {
    records: AdminRecord[];
    onDownload: typeof download;
}) {
    return <section className="space-y-4"><button className={buttonClass} disabled={!records.length} onClick={() => onDownload("smart-learn-reporte-academico.csv", records)}><Download className="h-4 w-4"/>Exportar reporte</button><p className="text-xs text-muted-foreground">Promedio por calificación publicada, sin ponderación. La asistencia contabiliza presentes y llegadas tarde sobre todos los registros.</p><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full text-left text-sm"><thead className="bg-secondary"><tr>{["Materia", "Matrículas activas", "Notas publicadas", "Promedio (%)", "Asistencia (%)"].map(s => <th key={s} className="whitespace-nowrap p-4">{s}</th>)}</tr></thead><tbody>{records.map(r => <tr key={r.id} className="border-t border-border"><td className="p-4 font-medium">{String(r.name)}</td>{["activeEnrollments", "publishedGrades", "averagePercentage", "attendancePercentage"].map(k => <td key={k} className="p-4">{r[k] == null ? "Sin datos" : String(r[k])}</td>)}</tr>)}</tbody></table></div>{!records.length && <p>No hay materias para generar el reporte.</p>}</section>;
}
