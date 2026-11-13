"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where, type Query, type DocumentData } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/client";
import { useLiveQuery } from "@/lib/firebase/use-live-query";
import type { TeacherAssessment } from "@/types/teacher-assessment";

export type Enrollment = { courseId: string; sectionId: string; studentId: string; status: string };
export type Course = { name: string; code: string; description: string; teacherId: string; status: string };
export function useStudentEnrollments() {
  const { profile } = useAuth();
  const ref = useMemo(() => profile ? query(collection(db, "enrollments"), where("studentId", "==", profile.uid)) : null, [profile]);
  return useLiveQuery<Enrollment>(ref);
}

type CourseEntry = { id: string; course?: Course; failed?: boolean };
export function useEnrolledCourses(ids: string[]) {
  const { profile } = useAuth();
  const idsKey = JSON.stringify(ids);
  const source = `${profile?.uid || ""}:${idsKey}`;
  const [snapshot, setSnapshot] = useState<{ source: string; entries: Record<string, CourseEntry> } | null>(null);
  useEffect(() => {
    if (!profile?.uid) return;
    const currentIds: string[] = JSON.parse(idsKey);
    let active = true;
    const update = (id: string, entry: CourseEntry) => {
      if (active) setSnapshot(previous => ({ source, entries: { ...(previous?.source === source ? previous.entries : {}), [id]: entry } }));
    };
    const unsubscribe = currentIds.map(id => onSnapshot(query(collection(db, "courses"), where("__name__", "==", id)), result => {
      const record = result.docs[0];
      update(id, record ? { id, course: record.data() as Course } : { id, failed: true });
    }, () => update(id, { id, failed: true })));
    return () => { active = false; unsubscribe.forEach(stop => stop()); };
  }, [idsKey, profile?.uid, source]);
  const entries = snapshot?.source === source ? snapshot.entries : {};
  return ids.map(id => entries[id] || { id });
}


export function useLiveCourse(id: string) {
  const { profile } = useAuth();
  const ref = useMemo(() => profile && id ? query(collection(db, "courses"), where("__name__", "==", id)) : null, [id, profile]);
  return useLiveQuery<Course>(ref);
}

export type PublishedLesson = { id: string; courseId: string; sectionId?: string | null; title: string; unit?: string; startDate?: string; estimatedMinutes?: number };
export type StudentMeeting = { id: string; courseId: string; title: string; startsAt?: string; url: string };
export type StudentProgress = { courseId: string; currentLessonId: string; completedLessonIds: string[]; updatedAt?: { toMillis?: () => number } };
export type StudentGrade = { id: string; courseId: string; assessmentId: string; score: number; maxScore: number; normalizedPercentage: number; feedback?: string; status: string };

// Every query retains the course/section/publication constraints used by the classroom.
function useResourceGroup<T extends { id: string }>(refs: Query<DocumentData>[], identity: string) {
  const [snapshot, setSnapshot] = useState<{ identity: string; parts: Record<number, { data: T[]; failed: boolean }> } | null>(null);
  useEffect(() => {
    let active = true;
    const update = (index: number, data: T[], failed: boolean) => {
      if (active) setSnapshot(previous => ({ identity, parts: { ...(previous?.identity === identity ? previous.parts : {}), [index]: { data, failed } } }));
    };
    const stops = refs.map((ref, index) => onSnapshot(ref, result => update(index, result.docs.map(d => ({ ...d.data(), id: d.id }) as T), false), () => update(index, [], true)));
    return () => { active = false; stops.forEach(stop => stop()); };
  }, [identity, refs]);
  const parts = snapshot?.identity === identity ? Object.values(snapshot.parts) : [];
  return { data: [...new Map(parts.flatMap(part => part.data).map(item => [item.id, item])).values()], loading: parts.length < refs.length, error: parts.some(part => part.failed) };
}
export function useStudentWorkspace(mode: "home" | "courses" | "assessments") {
  const { profile } = useAuth();
  const enrollment = useStudentEnrollments();
  const scopeKey = JSON.stringify([...new Set(enrollment.data.filter(e => e.status === "active").map(e => JSON.stringify([e.courseId, e.sectionId])))].sort());
  const scopes: [string, string][] = useMemo(() => JSON.parse(scopeKey).map((value: string) => JSON.parse(value)), [scopeKey]);
  const ids = [...new Set(scopes.map(([course]) => course))].sort();
  const courses = useEnrolledCourses(ids);
  const uid = profile?.uid;
  const refs = useMemo(() => {
    const resource = (name: string, enabled: boolean) => !uid || !enabled ? [] : [...new Map(scopes.flatMap(([courseId, sectionId]) => [sectionId, null].map(section => [JSON.stringify([courseId, section]), query(collection(db, name), where("courseId", "==", courseId), where("sectionId", "==", section), where("visibleToStudents", "==", true))] as const))).values()];
    return { lessons: resource("lessonPlans", mode !== "assessments"), assessments: resource("assessments", mode !== "courses"), meetings: resource("onlineClasses", mode === "home") };
  }, [scopes, mode, uid]);
  const identity = `${uid || ""}:${mode}:${scopeKey}`;
  const lessons = useResourceGroup<PublishedLesson>(refs.lessons, identity);
  const assessments = useResourceGroup<TeacherAssessment>(refs.assessments, identity);
  const meetings = useResourceGroup<StudentMeeting>(refs.meetings, identity);
  const progressRef = useMemo(() => uid && mode !== "assessments" ? query(collection(db, "users", uid, "courseProgress")) : null, [uid, mode]);
  const gradeRef = useMemo(() => uid && mode === "assessments" ? query(collection(db, "grades"), where("studentId", "==", uid), where("status", "==", "published")) : null, [uid, mode]);
  const progress = useLiveQuery<StudentProgress>(progressRef);
  const grades = useLiveQuery<StudentGrade>(gradeRef);
  const idsSet = new Set(ids);
  return { enrollment, courses, lessons, assessments, meetings, progress: { ...progress, data: progress.data.filter(p => idsSet.has(p.courseId)) }, grades: { ...grades, data: grades.data.filter(g => idsSet.has(g.courseId)) }, loading: enrollment.loading || courses.some(e => !e.course && !e.failed), error: !!enrollment.error || courses.some(e => e.failed), profile };
}
export type StudentWorkspace = ReturnType<typeof useStudentWorkspace>;
