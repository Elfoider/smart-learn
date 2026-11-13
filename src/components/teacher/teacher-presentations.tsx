"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";

const deckSchema = z.object({
  title: z.string().max(180),
  slides: z.array(z.object({ title: z.string().max(180), body: z.string().max(3000) })).min(1).max(60),
});
type Deck = z.infer<typeof deckSchema>;
const field = "mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm";
const button = "rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40";

export function TeacherPresentations() {
  const [deck, setDeck] = useState<Deck>({ title: "", slides: [{ title: "", body: "" }] });
  const [position, setPosition] = useState(0);
  const [editing, setEditing] = useState(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const slide = deck.slides[position];
  const [pdfUrl, setPdfUrl] = useState("");
  useEffect(() => {
    if (pdfUrl) return () => URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  async function importCanvaPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 25_000_000 || await file.slice(0, 5).text() !== "%PDF-") {
        throw new Error();
      }
      setPdfUrl(URL.createObjectURL(new Blob([file], { type: "application/pdf" })));
    } catch {
      toast.error("Selecciona un PDF válido de hasta 25 MB.");
    }
  }

  function patchSlide(key: "title" | "body", value: string) {
    setDeck(current => ({
      ...current,
      slides: current.slides.map((item, index) => index === position ? { ...item, [key]: value } : item),
    }));
  }

  function save() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(deck, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "presentacion-smart-learn.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function load(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 1_000_000) throw new Error();
      const imported = deckSchema.parse(JSON.parse(await file.text()));
      if ((deck.title || deck.slides.some(item => item.title || item.body)) && !window.confirm("¿Reemplazar la presentación abierta? Descárgala primero si quieres conservarla.")) return;
      setDeck(imported);
      setPosition(0);
    } catch {
      toast.error("El archivo no es una presentación válida de Smart Learn.");
    }
  }

  function move(change: number) {
    setPosition(index => Math.max(0, Math.min(deck.slides.length - 1, index + change)));
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-3xl font-semibold">Presentaciones docentes</h1>
        <p className="mt-2 text-sm text-muted-foreground">Crea diapositivas de texto y descarga el archivo para volver a editarlo.</p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <button className={button} type="button" onClick={save}>Descargar presentación</button>
        <label className="text-sm font-medium">Abrir presentación de Smart Learn
          <input type="file" accept=".json,application/json" onChange={load} className="ml-2 max-w-full text-sm" />
        </label>
        <button className={button} type="button" onClick={() => dialog.current?.showModal()}>Presentar</button>
      </div>
      <section className="rounded-xl border border-border bg-card p-4">
        <label className="block text-sm font-medium">Abrir PDF exportado de Canva
          <input type="file" accept=".pdf,application/pdf" onChange={importCanvaPdf} className="mt-2 block max-w-full text-sm" />
        </label>
        {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary underline">Abrir PDF en otra pestaña</a>}
      </section>
      <label className="block text-sm font-medium">Título de la presentación
        <input className={field} value={deck.title} maxLength={180} onChange={event => setDeck({ ...deck, title: event.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button className={button} type="button" disabled={position === 0} onClick={() => move(-1)}>Anterior</button>
        <span aria-live="polite" className="px-2 text-sm">{position + 1} de {deck.slides.length}</span>
        <button className={button} type="button" disabled={position + 1 >= deck.slides.length} onClick={() => move(1)}>Siguiente</button>
        <button className={button} type="button" disabled={deck.slides.length >= 60} onClick={() => {
          setDeck({ ...deck, slides: [...deck.slides, { title: "", body: "" }] });
          setPosition(deck.slides.length);
          setEditing(true);
        }}>Añadir diapositiva</button>
        <button className={button} type="button" disabled={deck.slides.length === 1} onClick={() => {
          if (!window.confirm("¿Eliminar la diapositiva actual?")) return;
          setDeck({ ...deck, slides: deck.slides.filter((_, index) => index !== position) });
          setPosition(Math.min(position, deck.slides.length - 2));
        }}>Eliminar diapositiva</button>
        <button className={button} type="button" onClick={() => setEditing(!editing)}>{editing ? "Vista previa" : "Editar"}</button>
      </div>
      {editing ? (
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-4">
          <label className="text-sm font-medium">Título de la diapositiva
            <input className={field} value={slide.title} maxLength={180} onChange={event => patchSlide("title", event.target.value)} />
          </label>
          <label className="text-sm font-medium">Contenido
            <textarea className={field} rows={7} value={slide.body} maxLength={3000} onChange={event => patchSlide("body", event.target.value)} />
          </label>
        </div>
      ) : <Slide title={slide.title} body={slide.body} />}
      <dialog ref={dialog} aria-label="Modo presentación" className="m-auto max-h-[92dvh] w-[95vw] max-w-5xl overflow-auto rounded-2xl bg-card p-4 text-foreground backdrop:bg-black/80"
        onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="break-words text-sm font-semibold">{deck.title || "Presentación"}</p>
          <div className="flex flex-wrap gap-2">
            <button className={button} type="button" disabled={position === 0} onClick={() => move(-1)}>Anterior</button>
            <button className={button} type="button" disabled={position + 1 >= deck.slides.length} onClick={() => move(1)}>Siguiente</button>
            <button className={button} type="button" onClick={() => dialog.current?.close()}>Cerrar</button>
          </div>
        </div>
        <Slide title={slide.title} body={slide.body} />
      </dialog>
    </div>
  );
}

function Slide({ title, body }: { title: string; body: string }) {
  return (
    <article className="min-h-[18rem] rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 to-background p-6 sm:p-10">
      <h2 className="break-words text-2xl font-semibold sm:text-4xl">{title || "Diapositiva sin título"}</h2>
      <p className="mt-5 whitespace-pre-wrap break-words text-base leading-relaxed sm:text-xl">{body}</p>
    </article>
  );
}
