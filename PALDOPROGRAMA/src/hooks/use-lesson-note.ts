"use client";

import {
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import {
  saveLessonNote,
  subscribeToLessonNote,
} from "@/lib/firebase/student-learning-service";

interface UseLessonNoteOptions {
  courseId: string;
  lessonId: string;
}

export function useLessonNote({
  courseId,
  lessonId,
}: UseLessonNoteOptions) {
  const { profile } = useAuth();
  const userId = profile?.uid;

  const [content, setContent] =
    useState("");

  const [savedContent, setSavedContent] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    return subscribeToLessonNote(
      userId,
      courseId,
      lessonId,
      (note) => {
        const nextContent =
          note?.content ?? "";

        setContent(nextContent);
        setSavedContent(nextContent);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Error cargando nota:",
          error,
        );

        setLoading(false);

        toast.error(
          "No se pudo cargar la nota",
        );
      },
    );
  }, [
    courseId,
    lessonId,
    userId,
  ]);

  async function save() {
    if (!userId) {
      return;
    }

    setSaving(true);

    try {
      await saveLessonNote(
        userId,
        {
          courseId,
          lessonId,
          content,
        },
      );

      setSavedContent(content);

      toast.success("Nota guardada", {
        description:
          "Tu nota personal fue sincronizada.",
      });
    } catch (error) {
      console.error(
        "Error guardando nota:",
        error,
      );

      toast.error(
        "No fue posible guardar la nota",
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    content,
    setContent,
    loading,
    saving,
    dirty: content !== savedContent,
    save,
  };
}