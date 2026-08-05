import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.com" },
    update: {},
    create: {
      name: "Demo Teacher",
      email: "teacher@demo.com",
      passwordHash,
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@demo.com",
      passwordHash,
      role: "STUDENT",
    },
  });

  const course = await prisma.course.upsert({
    where: { id: "course-intro-nextjs" },
    update: {},
    create: {
      id: "course-intro-nextjs",
      title: "Introduction to Next.js",
      description:
        "Learn the fundamentals of Next.js: routing, server components, and server actions.",
      published: true,
      teacherId: teacher.id,
    },
  });

  const lesson1 = await prisma.lesson.upsert({
    where: { id: "lesson-routing" },
    update: {},
    create: {
      id: "lesson-routing",
      courseId: course.id,
      title: "File-based Routing",
      content:
        "In Next.js, the folder structure inside `app/` is the URL structure. Each folder with a `page.tsx` becomes a route.",
      order: 1,
    },
  });

  await prisma.quiz.upsert({
    where: { lessonId: lesson1.id },
    update: {},
    create: {
      lessonId: lesson1.id,
      questions: [
        {
          question: "Which file makes a folder a page in Next.js?",
          options: ["index.tsx", "page.tsx", "layout.tsx", "route.tsx"],
          correctIndex: 1,
        },
        {
          question: "What does `app/about/page.tsx` map to?",
          options: ["/page", "/app", "/about", "/home"],
          correctIndex: 2,
        },
      ],
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: student.id, courseId: course.id },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
    },
  });

  console.log("Seeded demo data:");
  console.log("  teacher@demo.com / password123");
  console.log("  student@demo.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
