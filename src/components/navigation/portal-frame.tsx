"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronsLeft, ChevronsRight, Focus, HelpCircle, LogOut, Menu, Search, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstitutionNotice } from "@/components/admin/institution-notice";
import { useAuth } from "@/hooks/use-auth";
import { usePortalPreference } from "@/hooks/use-portal-preference";
import { cn } from "@/lib/utils/cn";

export type PortalItem = { id: string; label: string; icon: LucideIcon; href?: string; group?: string };
type Props = { role: "student" | "teacher" | "admin"; items: readonly PortalItem[]; currentId: string; onNavigate?: (id: string) => void; children: ReactNode };
const roleNames = { student: "Estudiante", teacher: "Docente", admin: "Administrador" };
const guides = {
  student: ["Entra en Mis materias y selecciona tu clase.", "Abre el índice para cambiar de unidad y registra tu avance.", "Usa Playground para practicar los temas publicados."],
  teacher: ["Organiza tus asignaturas y secciones antes de publicar contenido.", "Prepara la clase en Planificación y publica sus materiales.", "Consulta evaluaciones, asistencia y reportes desde el menú."],
  admin: ["Crea o vincula usuarios desde Usuarios.", "Organiza materias, secciones y matrículas.", "Supervisa publicaciones y revisa cada cambio en Auditoría."],
};
export function PortalFrame({ role, items, currentId, onNavigate, children }: Props) {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = usePortalPreference(`smart-learn-navigation-${role}`, true);
  const [focus, setFocus] = usePortalPreference(`smart-learn-focus-${role}`, false);
  const [closing, setClosing] = useState(false);
  const [search, setSearch] = useState("");
  const menu = useRef<HTMLDialogElement>(null);
  const finder = useRef<HTMLDialogElement>(null);
  const help = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const current = items.find(item => item.id === currentId);
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const matches = items.filter(item => normalize(`${item.label} ${item.group || ""}`).includes(normalize(search.trim())));
  const openSearch = () => { setSearch(""); finder.current?.showModal(); searchInput.current?.focus(); };
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        e.preventDefault(); finder.current?.showModal(); searchInput.current?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  const select = (item: PortalItem) => { menu.current?.close(); finder.current?.close(); onNavigate?.(item.id); };
  async function logout() {
    setClosing(true);
    try { await signOut(); router.replace("/login"); router.refresh(); }
    catch { toast.error("No se pudo cerrar sesión. Inténtalo nuevamente."); }
    finally { setClosing(false); }
  }
  function navigation(expanded: boolean) {
    return <nav aria-label={`Navegación ${roleNames[role].toLowerCase()}`} className="space-y-1">
      {items.map((item, index) => {
        const Icon = item.icon;
        const active = currentId === item.id;
        const content = <><Icon aria-hidden="true" className="h-5 w-5 shrink-0" />{expanded && <span className="truncate">{item.label}</span>}</>;
        const className = cn("portal-nav-item", expanded ? "justify-start px-3" : "justify-center px-0", active && "is-active");
        return <div key={item.id}>
          {expanded && item.group && item.group !== items[index - 1]?.group && <p className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.group}</p>}
          {item.href ? <Link href={item.href} onClick={() => select(item)} className={className} aria-current={active ? "page" : undefined} aria-label={item.label} title={!expanded ? item.label : undefined}>{content}</Link>
            : <button type="button" onClick={() => select(item)} className={className} aria-current={active ? "page" : undefined} aria-label={item.label} title={!expanded ? item.label : undefined}>{content}</button>}
        </div>;
      })}
    </nav>;
  }
  function studentUtilities() {
    return <div className="student-utilities">
      <button className="portal-icon" aria-label="Buscar una sección" title="Buscar una sección (Ctrl+K)" onClick={openSearch}><Search className="h-4 w-4" /></button>
      <InstitutionNotice compact />
      <button className="portal-icon" aria-label="Abrir guía de uso" title="Guía de uso" onClick={() => help.current?.showModal()}><HelpCircle className="h-4 w-4" /></button>
      <ThemeToggle className="!h-10 !w-10 !rounded-xl" />
      <button className="portal-icon" aria-pressed={focus} aria-label="Activar modo concentración" title="Modo concentración" onClick={() => { menu.current?.close(); setFocus(true); }}><Focus className="h-4 w-4" /></button>
    </div>;
  }
  return <div className={cn("portal-frame", collapsed && "is-collapsed", focus && "is-focused")} data-portal={role}>
    <a href="#portal-content" className="portal-skip">Saltar al contenido</a>
    <aside className="portal-sidebar">
      <div className={cn("flex h-20 shrink-0 items-center", collapsed ? "justify-center" : "px-3")}><BrandMark compact={collapsed} /></div>
      <div className="flex-1 px-2 pb-3">{navigation(!collapsed)}</div>
      <div className="shrink-0 space-y-2 border-t border-border p-2">
        {role === "student" && studentUtilities()}
        {!collapsed && <p className="truncate px-3 text-xs text-muted-foreground">{profile?.name} · {roleNames[role]}</p>}
        <button className="portal-nav-item" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expandir navegación" : "Contraer navegación"} title={collapsed ? "Expandir navegación" : "Contraer navegación"} aria-expanded={!collapsed}>{collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}{!collapsed && "Contraer menú"}</button>
        <button className="portal-nav-item" onClick={() => void logout()} disabled={closing} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut className="h-5 w-5" />{!collapsed && (closing ? "Saliendo…" : "Cerrar sesión")}</button>
      </div>
    </aside>
    <div className="portal-body">
      {role !== "student" && <header className="portal-toolbar">
        {!focus && <button className="portal-icon portal-mobile-menu" aria-label="Abrir navegación" onClick={() => menu.current?.showModal()}><Menu className="h-5 w-5" /></button>}
        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{current?.label || "Smart Learn"}</p><p className="text-[11px] text-muted-foreground">{focus ? "Modo concentración" : `Portal ${roleNames[role].toLowerCase()}`}</p></div>
        {!focus && <><button className="portal-icon" aria-label="Buscar una sección" title="Buscar una sección (Ctrl+K)" onClick={openSearch}><Search className="h-4 w-4" /></button><InstitutionNotice compact /><button className="portal-icon" aria-label="Abrir guía de uso" title="Guía de uso" onClick={() => help.current?.showModal()}><HelpCircle className="h-4 w-4" /></button><ThemeToggle className="!h-10 !w-10 !rounded-xl" /></>}
        <button className={cn("portal-icon", focus && "!w-auto gap-2 px-3")} aria-pressed={focus} aria-label={focus ? "Salir de concentración" : "Activar modo concentración"} title={focus ? "Salir de concentración" : "Modo concentración"} onClick={() => setFocus(!focus)}><Focus className="h-4 w-4" />{focus && <span className="text-xs">Volver</span>}</button>
      </header>}
      {role === "student" && <div className="student-floating-controls">{focus ? <button className="portal-icon !w-auto gap-2 px-3" aria-label="Salir de concentración" onClick={() => setFocus(false)}><Focus className="h-4 w-4" /><span className="text-xs">Volver</span></button> : <button className="portal-icon portal-mobile-menu" aria-label="Abrir navegación" onClick={() => menu.current?.showModal()}><Menu className="h-5 w-5" /></button>}</div>}
      <main id="portal-content" tabIndex={-1} className="portal-content">{children}</main>
    </div>
    <dialog ref={menu} className="portal-dialog portal-menu-dialog" aria-label="Menú de navegación">
      <div className="mb-3 flex items-center justify-between"><BrandMark /><button className="portal-icon" aria-label="Cerrar navegación" onClick={() => menu.current?.close()}><X className="h-5 w-5" /></button></div>
      {navigation(true)}
      {role === "student" && studentUtilities()}
      <button className="portal-nav-item mt-4" disabled={closing} onClick={() => void logout()}><LogOut className="h-5 w-5" />{closing ? "Saliendo…" : "Cerrar sesión"}</button>
    </dialog>
    <dialog ref={finder} className="portal-dialog" aria-labelledby="finder-title">
      <div className="mb-4 flex items-center justify-between gap-4"><h2 id="finder-title" className="text-lg font-semibold">¿Dónde quieres ir?</h2><button className="portal-icon" aria-label="Cerrar búsqueda" onClick={() => finder.current?.close()}><X className="h-5 w-5" /></button></div>
      <input ref={searchInput} className="w-full rounded-xl border border-border bg-background px-4 py-3" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar una sección del portal" aria-label="Buscar secciones" />
      <p className="my-3 text-xs text-muted-foreground">Accesos a tus herramientas. La búsqueda de registros está dentro de cada módulo.</p>
      <div className="space-y-1">{matches.map(item => item.href ? <Link key={item.id} href={item.href} onClick={() => select(item)} className="portal-nav-item"><item.icon className="h-5 w-5" />{item.label}<ArrowRight className="ml-auto h-4 w-4" /></Link> : <button key={item.id} onClick={() => select(item)} className="portal-nav-item"><item.icon className="h-5 w-5" />{item.label}<ArrowRight className="ml-auto h-4 w-4" /></button>)}</div>
      {!matches.length && <p role="status" className="py-8 text-center text-sm text-muted-foreground">No encontramos esa sección. Prueba con otra palabra.</p>}
    </dialog>
    <dialog ref={help} className="portal-dialog" aria-labelledby="guide-title">
      <div className="flex items-center justify-between"><h2 id="guide-title" className="text-xl font-semibold">Tu espacio, paso a paso</h2><button className="portal-icon" aria-label="Cerrar guía" onClick={() => help.current?.close()}><X className="h-5 w-5" /></button></div>
      <p className="mt-2 text-sm text-muted-foreground">{roleNames[role]} · Smart Learn</p>
      <ol className="my-6 space-y-3">{guides[role].map((text, i) => <li key={text} className="flex gap-3 rounded-2xl bg-muted p-4 text-sm leading-6"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">{i + 1}</span>{text}</li>)}</ol>
      <p className="text-sm leading-6 text-muted-foreground">Abre el menú para ver sus etiquetas. Activa concentración para dedicar la pantalla al contenido. Puedes volver a esta guía cuando quieras.</p>
      <button className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground" onClick={() => help.current?.close()}>Entendido, continuar</button>
    </dialog>
  </div>;
}
