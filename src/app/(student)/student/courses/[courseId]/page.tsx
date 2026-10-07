import type { Metadata } from "next";

import { LiveClassroom } from "@/components/student/live-classroom";
import { LearningClassroom } from "@/components/learning/learning-classroom";
import {
  getLearningCourse,
  learningCourses,
} from "@/data/course-content";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export function generateStaticParams() {
  return learningCourses.map((course) => ({
    courseId: course.id,
  }));
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getLearningCourse(courseId);

  if (!course) {
    return {
      title: "Salón virtual",
    };
  }

  return {
    title: course.title,
    description: course.description,
  };
}

export default async function CoursePage({
  params,
}: CoursePageProps) {
  const { courseId } = await params;
  const course = getLearningCourse(courseId);

  if (!course) {
    return <LiveClassroom key={courseId} courseId={courseId} />;
  }

  return (
    <LearningClassroom course={course} />
  );
}