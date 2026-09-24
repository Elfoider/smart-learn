"use client";

import {
  ChevronLeft,
  ChevronRight,
  Keyboard,
  ListChecks,
  Route,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type { CourseLesson } from "@/data/course-content";
import {
  getLessonSlides,
  type LessonSlide,
} from "@/data/lesson-slides";
import { cn } from "@/lib/utils/cn";

interface SlidePlayerProps {
  lesson: CourseLesson;
  courseTitle: string;
}

export function SlidePlayer({
  lesson,
  courseTitle,
}: SlidePlayerProps) {
  const slides = getLessonSlides(lesson);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const currentSlide =
    slides[currentIndex];

  const hasPrevious = currentIndex > 0;
  const hasNext =
    currentIndex < slides.length - 1;

  function previousSlide() {
    if (!hasPrevious) {
      return;
    }

    setCurrentIndex(
      (current) => current - 1,
    );
  }

  function nextSlide() {
    if (!hasNext) {
      return;
    }

    setCurrentIndex(
      (current) => current + 1,
    );
  }

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      const target =
        event.target as HTMLElement | null;

      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((current) =>
          Math.max(current - 1, 0),
        );
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((current) =>
          Math.min(
            current + 1,
            slides.length - 1,
          ),
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [slides.length]);

  if (!currentSlide) {
    return (
      <div className="flex min-h-[31rem] items-center justify-center bg-[#06171e] p-6 text-center text-white lg:min-h-[38rem]">
        <p className="text-sm text-white/60">
          Esta lección todavía no contiene
          diapositivas.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[31rem] flex-col overflow-hidden bg-[#06171e] p-5 text-white sm:p-8 lg:min-h-[38rem]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(44,221,198,0.22),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(112,101,255,0.22),transparent_34%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/60">
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#5ce6d4]"
            />

            {currentSlide.eyebrow}
          </div>

          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/55">
            {currentIndex + 1} /{" "}
            {slides.length}
          </span>
        </div>

        <div className="flex flex-1 items-center py-8">
          <article className="w-full rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl sm:p-9 lg:p-12">
            <SlideContent
              slide={currentSlide}
            />
          </article>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-white/35">
              {courseTitle}
            </p>

            <div className="mt-2 flex items-center gap-2 text-[0.68rem] text-white/35">
              <Keyboard
                aria-hidden="true"
                className="h-3.5 w-3.5"
              />

              Usa las flechas del teclado
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(index);
                  }}
                  aria-label={`Abrir diapositiva ${
                    index + 1
                  }`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === currentIndex
                      ? "w-8 bg-[#35ddc7]"
                      : "w-2 bg-white/20 hover:bg-white/40",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={!hasPrevious}
              onClick={previousSlide}
              aria-label="Diapositiva anterior"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition-all hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>

            <button
              type="button"
              disabled={!hasNext}
              onClick={nextSlide}
              aria-label="Diapositiva siguiente"
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#35ddc7] text-[#04231f] transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight
                aria-hidden="true"
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SlideContentProps {
  slide: LessonSlide;
}

function SlideContent({
  slide,
}: SlideContentProps) {
  const Icon =
    slide.layout === "steps"
      ? Route
      : slide.layout === "summary"
        ? ListChecks
        : Sparkles;

  return (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#35ddc7] text-[#04231f]">
        <Icon
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <h3 className="mt-7 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
        {slide.title}
      </h3>

      <p className="mt-5 max-w-4xl text-sm leading-7 text-white/60 sm:text-base">
        {slide.body}
      </p>

      <div
        className={cn(
          "mt-8 grid gap-3",
          slide.layout === "points" &&
            "md:grid-cols-2",
        )}
      >
        {slide.points.map(
          (point, index) => (
            <div
              key={`${slide.id}-${point}`}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#35ddc7] text-xs font-bold text-[#04231f]">
                {index + 1}
              </div>

              <p className="pt-1 text-sm leading-6 text-white/75">
                {point}
              </p>
            </div>
          ),
        )}
      </div>
    </>
  );
}