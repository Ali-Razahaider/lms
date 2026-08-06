import { CourseForm } from "@/components/course-form";
import { createCourse } from "@/lib/actions/teacher";
import { requireTeacher } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function NewCoursePage() {
  // Guards the route; redirects away if not a teacher.
  await requireTeacher();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">New course</h1>
      <p className="mt-2 mb-8 text-muted">
        Fill in the basics — you can add lessons once it&apos;s created.
      </p>
      <CourseForm action={createCourse} categories={categories} />
    </div>
  );
}
