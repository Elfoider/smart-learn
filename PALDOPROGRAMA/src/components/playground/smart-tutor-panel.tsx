"use client";

import {
  Bot,
  BrainCircuit,
  CircleHelp,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  useState,
} from "react";

import type {
  PlaygroundCourse,
  PlaygroundExercise,
  PlaygroundTopic,
} from "@/data/playground";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils/cn";
import type {
  TutorAction,
  TutorHistoryMessage,
  TutorProvider,
  TutorResponsePayload,
} from "@/types/tutor";

interface SmartTutorPanelProps {
  course: PlaygroundCourse;
  topic: PlaygroundTopic;
  exercise: PlaygroundExercise;
}

interface TutorUiMessage
  extends TutorHistoryMessage {
  id: string;
  provider?: TutorProvider;
}

const quickActions: Array<{
  action: TutorAction;
  label: string;
  message: string;
}> = [
  {
    action: "explain",
    label: "Explícame",
    message:
      "Explícame el concepto principal de este ejercicio con palabras sencillas.",
  },
  {
    action: "hint",
    label: "Dame una pista",
    message:
      "Dame una pista breve para comenzar, sin decirme la respuesta.",
  },
  {
    action: "example",
    label: "Ejemplo similar",
    message:
      "Muéstrame un ejemplo parecido, pero diferente al ejercicio.",
  },
];

export function SmartTutorPanel({
  course,
  topic,
  exercise,
}: SmartTutorPanelProps) {
  const { user } = useAuth();

  const [messages, setMessages] =
    useState<TutorUiMessage[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Estoy listo para ayudarte con este ejercicio. Puedo explicarte el concepto, darte una pista o mostrarte un ejemplo parecido.",
      },
    ]);

  const [draft, setDraft] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [remaining, setRemaining] =
    useState<number | null>(null);

  const [
    lastProvider,
    setLastProvider,
  ] = useState<
    TutorProvider | null
  >(null);

  async function sendRequest(
    action: TutorAction,
    message: string,
  ) {
    const cleanMessage =
      message.trim();

    if (
      !cleanMessage ||
      loading
    ) {
      return;
    }

    if (!user) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Tu sesión no está disponible. Vuelve a iniciar sesión para utilizar Smart Tutor.",
        },
      ]);

      return;
    }

    const userMessage:
      TutorUiMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: cleanMessage,
      };

    const previousHistory =
      messages
        .slice(-6)
        .map<TutorHistoryMessage>(
          (item) => ({
            role: item.role,
            content: item.content,
          }),
        );

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setDraft("");
    setLoading(true);

    try {
      const idToken =
        await user.getIdToken();

      const response = await fetch(
        "/api/ai/tutor",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            action,
            message: cleanMessage,
            courseId: course.id,
            courseCode:
              course.code,
            courseTitle:
              course.title,
            topicId: topic.id,
            topicTitle:
              topic.title,
            topicDescription:
              topic.description,
            exercise: {
              id: exercise.id,
              title:
                exercise.title,
              prompt:
                exercise.prompt,
              type: exercise.type,
              difficulty:
                exercise.difficulty,
              correctAnswer:
                exercise.correctAnswer,
              hints:
                exercise.hints,
              explanation:
                exercise.explanation,
            },
            history:
              previousHistory,
          }),
        },
      );

      const result =
        (await response.json()) as
          Partial<TutorResponsePayload> & {
            error?: string;
          };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "El asistente no pudo responder.",
        );
      }

      if (!result.message) {
        throw new Error(
          "El asistente devolvió una respuesta vacía.",
        );
      }

      const provider =
        result.provider ??
        "fallback";

      setLastProvider(provider);

      if (
        typeof result.remaining ===
        "number"
      ) {
        setRemaining(
          result.remaining,
        );
      }

      setMessages((current) => [
        ...current,
        {
          id:
            result.requestId ??
            crypto.randomUUID(),
          role: "assistant",
          content:
            result.message ?? "",
          provider,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "No fue posible obtener ayuda en este momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendDraft() {
    void sendRequest(
      "question",
      draft,
    );
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-primary/15 bg-secondary">
      <div className="border-b border-primary/15 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bot
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-foreground/65">
              Asistente académico
            </p>

            <h2 className="mt-1 text-sm font-semibold text-secondary-foreground">
              Smart Tutor
            </h2>
          </div>

          <div
            className={cn(
              "rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold",
              lastProvider ===
                "gemini"
                ? "border-primary/20 bg-primary text-primary-foreground"
                : "border-primary/15 bg-background/60 text-secondary-foreground",
            )}
          >
            {lastProvider === "gemini"
              ? "Gemini"
              : "Respaldo"}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[0.68rem] text-secondary-foreground/65">
          <ShieldCheck
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />

          Contexto académico sin datos personales
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-2">
          {quickActions.map(
            (item) => (
              <button
                key={item.action}
                type="button"
                disabled={loading}
                onClick={() => {
                  void sendRequest(
                    item.action,
                    item.message,
                  );
                }}
                className="flex min-h-10 items-center gap-2 rounded-xl border border-primary/15 bg-background/55 px-3 text-left text-xs font-semibold text-secondary-foreground transition-all hover:border-primary/35 hover:bg-background disabled:pointer-events-none disabled:opacity-50"
              >
                {item.action ===
                "explain" && (
                  <BrainCircuit
                    aria-hidden="true"
                    className="h-4 w-4 text-primary"
                  />
                )}

                {item.action ===
                "hint" && (
                  <Lightbulb
                    aria-hidden="true"
                    className="h-4 w-4 text-primary"
                  />
                )}

                {item.action ===
                "example" && (
                  <Sparkles
                    aria-hidden="true"
                    className="h-4 w-4 text-primary"
                  />
                )}

                {item.label}
              </button>
            ),
          )}
        </div>

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
          {messages.map((message) => (
            <article
              key={message.id}
              className={cn(
                "rounded-2xl border p-3 text-xs leading-6",
                message.role ===
                  "user"
                  ? "ml-6 border-primary/25 bg-primary text-primary-foreground"
                  : "mr-3 border-primary/15 bg-background/60 text-foreground",
              )}
            >
              <div className="mb-2 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] opacity-65">
                {message.role ===
                "user" ? (
                  <MessageCircle
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                ) : (
                  <Bot
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                )}

                {message.role ===
                "user"
                  ? "Estudiante"
                  : "Smart Tutor"}
              </div>

              <p className="whitespace-pre-wrap">
                {message.content}
              </p>
            </article>
          ))}

          {loading && (
            <div className="mr-3 flex items-center gap-3 rounded-2xl border border-primary/15 bg-background/60 p-3 text-xs text-muted-foreground">
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin text-primary"
              />

              Smart Tutor está analizando el ejercicio.
            </div>
          )}
        </div>

        <div className="mt-4">
          <label
            htmlFor="smart-tutor-message"
            className="mb-2 block text-xs font-semibold text-secondary-foreground"
          >
            Escribe una pregunta
          </label>

          <textarea
            id="smart-tutor-message"
            value={draft}
            disabled={loading}
            maxLength={1200}
            onChange={(event) => {
              setDraft(
                event.target.value,
              );
            }}
            onKeyDown={(event) => {
              if (
                event.key ===
                  "Enter" &&
                event.ctrlKey
              ) {
                event.preventDefault();
                sendDraft();
              }
            }}
            placeholder="Ejemplo: No entiendo por qué este dato debe cambiar..."
            className="min-h-24 w-full resize-y rounded-2xl border border-primary/15 bg-background/60 p-3 text-xs leading-6 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />

          <button
            type="button"
            disabled={
              loading ||
              draft.trim().length ===
                0
            }
            onClick={sendDraft}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <Send
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}

            Enviar al tutor
          </button>

          <div className="mt-3 flex items-center justify-between gap-3 text-[0.62rem] text-secondary-foreground/60">
            <span>
              Ctrl + Enter para enviar
            </span>

            {remaining !== null && (
              <span className="inline-flex items-center gap-1">
                <CircleHelp
                  aria-hidden="true"
                  className="h-3 w-3"
                />

                {remaining} consultas disponibles
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}