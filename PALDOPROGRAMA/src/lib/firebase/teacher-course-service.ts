import {
  Timestamp,
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";

import {
  assertFirebaseConfigured,
  db,
} from "@/lib/firebase/client";
import type {
  AcademicCourse,
  AcademicCourseStatus,
  AcademicCourseTone,
  AcademicModality,
  AcademicSection,
  AcademicSectionStatus,
  CourseFormValues,
  CreateTeacherCourseInput,
  ScheduleDay,
  SectionFormValues,
} from "@/types/academic-course";

function safeNumber(
  value: unknown,
  fallback = 0,
) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function safeTimestampMillis(
  value: unknown,
) {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }

  return 0;
}

function safeStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string",
  );
}

function safeCourseStatus(
  value: unknown,
): AcademicCourseStatus {
  if (
    value === "active" ||
    value === "draft" ||
    value === "archived"
  ) {
    return value;
  }

  return "draft";
}

function safeSectionStatus(
  value: unknown,
): AcademicSectionStatus {
  return value === "inactive"
    ? "inactive"
    : "active";
}

function safeCourseTone(
  value: unknown,
): AcademicCourseTone {
  if (
    value === "violet" ||
    value === "amber" ||
    value === "blue"
  ) {
    return value;
  }

  return "teal";
}

function safeModality(
  value: unknown,
): AcademicModality {
  if (
    value === "online" ||
    value === "hybrid"
  ) {
    return value;
  }

  return "on-site";
}

function safeScheduleDays(
  value: unknown,
): ScheduleDay[] {
  const validDays: ScheduleDay[] = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
    "Dom",
  ];

  return safeStringArray(value).filter(
    (day): day is ScheduleDay =>
      validDays.includes(
        day as ScheduleDay,
      ),
  );
}

function normalizeCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

export function subscribeToTeacherCourses(
  teacherId: string,
  onData: (
    courses: AcademicCourse[],
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const coursesQuery = query(
    collection(db, "courses"),
    where(
      "teacherId",
      "==",
      teacherId,
    ),
  );

  return onSnapshot(
    coursesQuery,
    (snapshot) => {
      const courses =
        snapshot.docs
          .map((courseDocument) => {
            const data =
              courseDocument.data();

            return {
              id: courseDocument.id,
              teacherId:
                typeof data.teacherId ===
                "string"
                  ? data.teacherId
                  : "",
              name:
                typeof data.name ===
                "string"
                  ? data.name
                  : "",
              code:
                typeof data.code ===
                "string"
                  ? data.code
                  : "",
              description:
                typeof data.description ===
                "string"
                  ? data.description
                  : "",
              area:
                typeof data.area ===
                "string"
                  ? data.area
                  : "",
              period:
                typeof data.period ===
                "string"
                  ? data.period
                  : "",
              status: safeCourseStatus(
                data.status,
              ),
              tone: safeCourseTone(
                data.tone,
              ),
              sectionsCount:
                safeNumber(
                  data.sectionsCount,
                ),
              studentsCount:
                safeNumber(
                  data.studentsCount,
                ),
              createdAtMs:
                safeTimestampMillis(
                  data.createdAt,
                ),
              updatedAtMs:
                safeTimestampMillis(
                  data.updatedAt,
                ),
            } satisfies AcademicCourse;
          })
          .sort(
            (first, second) =>
              second.updatedAtMs -
              first.updatedAtMs,
          );

      onData(courses);
    },
    (error) => {
      onError(error);
    },
  );
}

export function subscribeToTeacherSections(
  teacherId: string,
  onData: (
    sections: AcademicSection[],
  ) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  assertFirebaseConfigured();

  const sectionsQuery = query(
    collection(db, "sections"),
    where(
      "teacherId",
      "==",
      teacherId,
    ),
  );

  return onSnapshot(
    sectionsQuery,
    (snapshot) => {
      const sections =
        snapshot.docs
          .map((sectionDocument) => {
            const data =
              sectionDocument.data();

            return {
              id: sectionDocument.id,
              teacherId:
                typeof data.teacherId ===
                "string"
                  ? data.teacherId
                  : "",
              courseId:
                typeof data.courseId ===
                "string"
                  ? data.courseId
                  : "",
              code:
                typeof data.code ===
                "string"
                  ? data.code
                  : "",
              scheduleDays:
                safeScheduleDays(
                  data.scheduleDays,
                ),
              startTime:
                typeof data.startTime ===
                "string"
                  ? data.startTime
                  : "",
              endTime:
                typeof data.endTime ===
                "string"
                  ? data.endTime
                  : "",
              classroom:
                typeof data.classroom ===
                "string"
                  ? data.classroom
                  : "",
              modality: safeModality(
                data.modality,
              ),
              capacity: safeNumber(
                data.capacity,
                30,
              ),
              status:
                safeSectionStatus(
                  data.status,
                ),
              createdAtMs:
                safeTimestampMillis(
                  data.createdAt,
                ),
              updatedAtMs:
                safeTimestampMillis(
                  data.updatedAt,
                ),
            } satisfies AcademicSection;
          })
          .sort((first, second) =>
            first.code.localeCompare(
              second.code,
              "es",
            ),
          );

      onData(sections);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createTeacherCourse(
  teacherId: string,
  input: CreateTeacherCourseInput,
) {
  assertFirebaseConfigured();

  const courseReference = doc(
    collection(db, "courses"),
  );

  const sectionReference = doc(
    collection(db, "sections"),
  );

  const batch = writeBatch(db);

  batch.set(courseReference, {
    teacherId,
    name: input.course.name.trim(),
    code: normalizeCode(
      input.course.code,
    ),
    description:
      input.course.description.trim(),
    area: input.course.area.trim(),
    period: input.course.period.trim(),
    status: input.course.status,
    tone: input.course.tone,
    sectionsCount: 1,
    studentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(sectionReference, {
    teacherId,
    courseId: courseReference.id,
    code: normalizeCode(
      input.section.code,
    ),
    scheduleDays:
      input.section.scheduleDays,
    startTime:
      input.section.startTime,
    endTime: input.section.endTime,
    classroom:
      input.section.classroom.trim(),
    modality:
      input.section.modality,
    capacity:
      input.section.capacity,
    status: input.section.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return courseReference.id;
}

export async function updateTeacherCourse(
  courseId: string,
  values: CourseFormValues,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "courses", courseId),
    {
      name: values.name.trim(),
      code: normalizeCode(
        values.code,
      ),
      description:
        values.description.trim(),
      area: values.area.trim(),
      period: values.period.trim(),
      status: values.status,
      tone: values.tone,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function setTeacherCourseStatus(
  courseId: string,
  status: AcademicCourseStatus,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "courses", courseId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function addTeacherSection(
  teacherId: string,
  courseId: string,
  values: SectionFormValues,
) {
  assertFirebaseConfigured();

  const sectionReference = doc(
    collection(db, "sections"),
  );

  const courseReference = doc(
    db,
    "courses",
    courseId,
  );

  const batch = writeBatch(db);

  batch.set(sectionReference, {
    teacherId,
    courseId,
    code: normalizeCode(values.code),
    scheduleDays:
      values.scheduleDays,
    startTime: values.startTime,
    endTime: values.endTime,
    classroom:
      values.classroom.trim(),
    modality: values.modality,
    capacity: values.capacity,
    status: values.status,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(courseReference, {
    sectionsCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return sectionReference.id;
}

export async function updateTeacherSection(
  sectionId: string,
  values: SectionFormValues,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "sections", sectionId),
    {
      code: normalizeCode(values.code),
      scheduleDays:
        values.scheduleDays,
      startTime: values.startTime,
      endTime: values.endTime,
      classroom:
        values.classroom.trim(),
      modality: values.modality,
      capacity: values.capacity,
      status: values.status,
      updatedAt: serverTimestamp(),
    },
  );
}

export async function setTeacherSectionStatus(
  sectionId: string,
  status: AcademicSectionStatus,
) {
  assertFirebaseConfigured();

  await updateDoc(
    doc(db, "sections", sectionId),
    {
      status,
      updatedAt: serverTimestamp(),
    },
  );
}