import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
      title: "Materia no encontrada",
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
    notFound();
  }

  return (
    <LearningClassroom course={course} />
  );
}