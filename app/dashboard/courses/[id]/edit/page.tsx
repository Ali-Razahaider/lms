import { CourseForm } from "@/components/course-form";
import { updateCourse } from "@/lib/actions/teacher";
import { requireCourseOwnership } from "@/lib/teacher";
import { prisma } from "@/lib/prisma";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { course } = await requireCourseOwnership(id);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Edit course</h1>
      <p className="mt-2 mb-8 text-muted">
        Update the title, description, price, or publish state.
      </p>
      <CourseForm
        action={updateCourse.bind(null, course.id)}
        categories={categories}
        initialValues={{
          title: course.title,
          description: course.description,
          priceDollars: (course.price / 100).toFixed(2),
          categoryId: course.categoryId ?? "",
          published: course.published,
        }}
      />
    </div>
  );
}
