import { LiveCourses } from "@/components/student/live-courses";
import { CourseCatalog } from "@/components/student/course-catalog";
export default function Page() { return <div className="space-y-8"><LiveCourses /><section><h2 className="mb-3 text-xl font-semibold">Aulas de demostración</h2><p className="mb-4 text-sm text-muted-foreground">Los contenidos siguientes son ejemplos para probar el prototipo.</p><CourseCatalog /></section></div>; }
