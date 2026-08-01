import {
  Timestamp,
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";

import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";
import type {
  LessonPlanFormValues,
  LessonPlanStatus,
  TeacherLessonPlan,
} from "@/types/teacher-planning";

function safeTimestampMillis(
  value: unknown,
) {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return 0;
}

function safeNullableTimestampMillis(
  value: unknown,
) {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return null;
}

function safeNumber(
  value: unknown,
  fallback = 0,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function safeStringArray(
  value: unknown,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function safePlanStatus(
  value: unknown,
): LessonPlanStatus {
  if (
    value === "scheduled" ||
    value === "in-progress" ||
    value === "completed" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function normalizeItems(
  values: string[],
) {
  return values
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseLessonPlan(
  id: string,
  data: Record<string, unknown>,
): TeacherLessonPlan {
  return {
    id,
    teacherId:
      typeof data.teacherId === "string"
        ? data.teacherId
        : "",
    courseId:
      typeof data.courseId === "string"
        ? data.courseId
        : "",
    sectionId:
      typeof data.sectionId === "string"
        ? data.sectionId
        : null,
    title:
      typeof data.title === "string"
        ? data.title
        : "",
    unit:
      typeof data.unit === "string"
        ? data.unit
        : "",
    weekLabel:
      typeof data.weekLabel === "string"
        ? data.weekLabel
        : "",
    startDate:
      typeof data.startDate === "string"
        ? data.startDate
        : "",
    endDate:
      typeof data.endDate === "string"
        ? data.endDate
        : "",
    estimatedMinutes: safeNumber(
      data.estimatedMinutes,
      90,
    ),
    objectives: safeStringArray(
      data.objectives,
    ),
    contents: safeStringArray(
      data.contents,
    ),
    strategies: safeStringArray(
      data.strategies,
    ),
    resources: safeStringArray(
      data.resources,
    ),
    activities: safeStringArray(
      data.activities,
    ),
    evaluationEvidence:
      typeof data.evaluationEvidence ===
      "string"
        ? data.evaluationEvidence
        : "",
    notes:
      typeof data.notes === "string"
        ? data.notes
        : "",
    status: safePlanStatus(
      data.status,
    ),
    visibleToStudents:
      data.visibleToStudents === true,
    createdAtMs:
      safeTimestampMillis(
        data.createdAt,
      ),
    updatedAtMs:
      safeTimestampMillis(
        data.updatedAt,
      ),
    publishedAtMs:
      safeNullableTimestampMillis(
        data.publishedAt,
      ),
  };
}

export function subscribeToTeacherPlans(
  teacherId: string,
  onData: (
    plans: TeacherLessonPlan[],
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const plansQuery = query(
    collection(db, "lessonPlans"),
    where(
      "teacherId",
      "==",
      teacherId,
    ),
  );

  return onSnapshot(
    plansQuery,
    (snapshot) => {
      const plans = snapshot.docs
        .map((planDocument) =>
          parseLessonPlan(
            planDocument.id,
            planDocument.data(),
          ),
        )
        .sort((first, second) => {
          if (
            first.startDate &&
            second.startDate &&
            first.startDate !==
              second.startDate
          ) {
            return first.startDate.localeCompare(
              second.startDate,
            );
          }

          return (
            second.updatedAtMs -
            first.updatedAtMs
          );
        });

      onData(plans);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createTeacherPlan(
  teacherId: string,
  values: LessonPlanFormValues,
) {
  assertFirebaseConfigured();

  const reference = await addDoc(
    collection(db, "lessonPlans"),
    {
      teacherId,
      courseId: values.courseId,
      sectionId:
        values.sectionId || null,
      title: values.title.trim(),
      unit: values.unit.trim(),
      weekLabel:
        values.weekLabel.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      estimatedMinutes:
        values.estimatedMinutes,
      objectives: normalizeItems(
        values.objectives,
      ),
      contents: normalizeItems(
        values.contents,
      ),
      strategies: normalizeItems(
        values.strategies,
      ),
      resources: normalizeItems(
        values.resources,
      ),
      activities: normalizeItems(
        values.activities,
      ),
      evaluationEvidence:
        values.evaluationEvidence.trim(),
      notes: values.notes.trim(),
      status: values.status,
      visibleToStudents:
        values.visibleToStudents,
      publishedAt:
        values.visibleToStudents
          ? serverTimestamp()
          : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return reference.id;
}

export async function updateTeacherPlan(
  planId: string,
  values: LessonPlanFormValues,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "lessonPlans", planId),
    {
      courseId: values.courseId,
      sectionId:
        values.sectionId || null,
      title: values.title.trim(),
      unit: values.unit.trim(),
      weekLabel:
        values.weekLabel.trim(),
      startDate: values.startDate,
      endDate: values.endDate,
      estimatedMinutes:
        values.estimatedMinutes,
      objectives: normalizeItems(
        values.objectives,
      ),
      contents: normalizeItems(
        values.contents,
      ),
      strategies: normalizeItems(
        values.strategies,
      ),
      resources: normalizeItems(
        values.resources,
      ),
      activities: normalizeItems(
        values.activities,
      ),
      evaluationEvidence:
        values.evaluationEvidence.trim(),
      notes: values.notes.trim(),
      status: values.status,
      visibleToStudents:
        values.visibleToStudents,
      publishedAt:
        values.visibleToStudents
          ? serverTimestamp()
          : null,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function setTeacherPlanStatus(
  planId: string,
  status: LessonPlanStatus,
) {
  assertFirebaseConfigured();

  const changes: Record<
    string,
    unknown
  > = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === "archived") {
    changes.visibleToStudents = false;
    changes.publishedAt = null;
  }

  await updateDoc(
    doc(db, "lessonPlans", planId),
    changes,
  );
}

export async function setTeacherPlanVisibility(
  planId: string,
  visibleToStudents: boolean,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "lessonPlans", planId),
    {
      visibleToStudents,
      publishedAt:
        visibleToStudents
          ? serverTimestamp()
          : null,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function duplicateTeacherPlan(
  teacherId: string,
  plan: TeacherLessonPlan,
) {
  assertFirebaseConfigured();

  const reference = await addDoc(
    collection(db, "lessonPlans"),
    {
      teacherId,
      courseId: plan.courseId,
      sectionId: plan.sectionId,
      title: `${plan.title} (copia)`,
      unit: plan.unit,
      weekLabel: plan.weekLabel,
      startDate: plan.startDate,
      endDate: plan.endDate,
      estimatedMinutes:
        plan.estimatedMinutes,
      objectives: plan.objectives,
      contents: plan.contents,
      strategies: plan.strategies,
      resources: plan.resources,
      activities: plan.activities,
      evaluationEvidence:
        plan.evaluationEvidence,
      notes: plan.notes,
      status: "draft",
      visibleToStudents: false,
      publishedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return reference.id;
}