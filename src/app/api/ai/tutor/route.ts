import {
  FieldValue,
} from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";

import { generateTutorResponse } from "@/lib/ai/tutor-service";
import {
  getAdminAuth,
  getAdminDb,
} from "@/lib/firebase/admin";
import type {
  TutorRequestPayload,
} from "@/types/tutor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const historyMessageSchema =
  z.object({
    role: z.enum([
      "user",
      "assistant",
    ]),
    content: z
      .string()
      .trim()
      .min(1)
      .max(1200),
  });

const exerciseSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(150),

  title: z
    .string()
    .trim()
    .min(1)
    .max(250),

  prompt: z
    .string()
    .trim()
    .min(1)
    .max(3000),

  type: z.enum([
    "multiple-choice",
    "true-false",
    "short-answer",
  ]),

  difficulty: z
    .string()
    .trim()
    .min(1)
    .max(80),

  correctAnswer: z
    .string()
    .trim()
    .min(1)
    .max(500),

  hints: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(500),
    )
    .max(6),

  explanation: z
    .string()
    .trim()
    .min(1)
    .max(3000),
});

const tutorRequestSchema =
  z.object({
    action: z.enum([
      "explain",
      "hint",
      "example",
      "question",
    ]),

    message: z
      .string()
      .trim()
      .max(1200)
      .default(""),

    courseId: z
      .string()
      .trim()
      .min(1)
      .max(150),

    courseCode: z
      .string()
      .trim()
      .min(1)
      .max(80),

    courseTitle: z
      .string()
      .trim()
      .min(1)
      .max(250),

    topicId: z
      .string()
      .trim()
      .min(1)
      .max(150),

    topicTitle: z
      .string()
      .trim()
      .min(1)
      .max(250),

    topicDescription: z
      .string()
      .trim()
      .max(1500),

    exercise: exerciseSchema,

    history: z
      .array(historyMessageSchema)
      .max(8)
      .default([]),
  });

function getDailyLimit() {
  const configuredLimit = Number(
    process.env.AI_DAILY_LIMIT ??
      "50",
  );

  if (
    !Number.isFinite(
      configuredLimit,
    )
  ) {
    return 50;
  }

  return Math.max(
    5,
    Math.min(
      200,
      Math.trunc(configuredLimit),
    ),
  );
}

function getBearerToken(
  request: Request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization?.startsWith(
      "Bearer ",
    )
  ) {
    return null;
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim();

  return token || null;
}

async function consumeDailyQuota(
  userId: string,
) {
  const db = getAdminDb();
  const limit = getDailyLimit();

  const dateKey =
    new Date()
      .toISOString()
      .slice(0, 10);

  const usageReference = db
    .collection("users")
    .doc(userId)
    .collection("aiUsage")
    .doc(dateKey);

  const result =
    await db.runTransaction(
      async (transaction) => {
        const snapshot =
          await transaction.get(
            usageReference,
          );

        const currentValue =
          snapshot.data()?.count;

        const currentCount =
          typeof currentValue ===
            "number" &&
          Number.isFinite(currentValue)
            ? currentValue
            : 0;

        if (
          currentCount >= limit
        ) {
          return {
            allowed: false,
            count: currentCount,
            limit,
          };
        }

        const nextCount =
          currentCount + 1;

        transaction.set(
          usageReference,
          {
            date: dateKey,
            count: nextCount,
            limit,
            updatedAt:
              FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        return {
          allowed: true,
          count: nextCount,
          limit,
        };
      },
    );

  return {
    ...result,
    remaining: Math.max(
      result.limit -
        result.count,
      0,
    ),
  };
}

async function saveAiLog({
  requestId,
  userId,
  payload,
  provider,
  model,
  fallbackReason,
}: {
  requestId: string;
  userId: string;
  payload: TutorRequestPayload;
  provider: string;
  model: string;
  fallbackReason?: string;
}) {
  try {
    await getAdminDb()
      .collection("aiLogs")
      .doc(requestId)
      .set({
        requestId,
        userId,
        role: "student",
        feature: "smart-tutor",
        action: payload.action,
        courseId: payload.courseId,
        topicId: payload.topicId,
        exerciseId:
          payload.exercise.id,
        provider,
        model,
        fallbackReason:
          fallbackReason ?? null,
        createdAt:
          FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error(
      "No fue posible registrar aiLogs:",
      error,
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const token =
      getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para utilizar Smart Tutor.",
        },
        {
          status: 401,
        },
      );
    }

    let decodedToken;

    try {
      decodedToken =
        await getAdminAuth()
          .verifyIdToken(token);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith(
          "firebase-admin/missing-config",
        )
      ) {
        throw error;
      }

      return NextResponse.json(
        {
          error:
            "La sesión no es válida o expiró.",
        },
        {
          status: 401,
        },
      );
    }

    const db = getAdminDb();

    const profileSnapshot =
      await db
        .collection("users")
        .doc(decodedToken.uid)
        .get();

    if (
      !profileSnapshot.exists
    ) {
      return NextResponse.json(
        {
          error:
            "No se encontró el perfil académico.",
        },
        {
          status: 403,
        },
      );
    }

    const profile =
      profileSnapshot.data();

    if (
      profile?.status !==
        "active" ||
      profile?.role !==
        "student"
    ) {
      return NextResponse.json(
        {
          error:
            "Tu perfil no tiene acceso a este asistente.",
        },
        {
          status: 403,
        },
      );
    }

    const requestBody =
      await request.json();

    const parsed =
      tutorRequestSchema.safeParse(
        requestBody,
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Los datos enviados al tutor no son válidos.",
          issues:
            parsed.error.issues.map(
              (issue) => ({
                field:
                  issue.path.join("."),
                message:
                  issue.message,
              }),
            ),
        },
        {
          status: 400,
        },
      );
    }

    const payload:
      TutorRequestPayload =
        parsed.data;

    const quota =
      await consumeDailyQuota(
        decodedToken.uid,
      );

    if (!quota.allowed) {
      return NextResponse.json(
        {
          error:
            "Alcanzaste el límite diario del prototipo.",
          remaining: 0,
        },
        {
          status: 429,
        },
      );
    }

    const generated =
      await generateTutorResponse(
        payload,
      );

    const requestId =
      crypto.randomUUID();

    await saveAiLog({
      requestId,
      userId: decodedToken.uid,
      payload,
      provider:
        generated.provider,
      model: generated.model,
      fallbackReason:
        generated.fallbackReason,
    });

    return NextResponse.json({
      message:
        generated.message,
      provider:
        generated.provider,
      model: generated.model,
      remaining:
        quota.remaining,
      requestId,
      fallbackReason:
        generated.fallbackReason,
    });
  } catch (error) {
    console.error(
      "Error en Smart Tutor:",
      error,
    );

    const missingAdminConfig =
      error instanceof Error &&
      error.message.startsWith(
        "firebase-admin/missing-config",
      );

    return NextResponse.json(
      {
        error: missingAdminConfig
          ? "Firebase Admin no está configurado. Revisa las variables privadas del archivo .env.local."
          : "Smart Tutor no pudo procesar la solicitud.",
      },
      {
        status: 500,
      },
    );
  }
}