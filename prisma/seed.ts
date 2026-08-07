import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Dates in the past so enrollment growth charts aren't flat.
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

type SeedLesson = { id: string; title: string; content: string; order: number };
type SeedCourse = {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  price: number; // cents; 0 = free
  lessons: SeedLesson[];
};

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.com" },
    update: {},
    create: { name: "Demo Teacher", email: "teacher@demo.com", passwordHash, role: "TEACHER" },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: { name: "Demo Student", email: "student@demo.com", passwordHash, role: "STUDENT" },
  });

  // A small cohort of extra students so the admin charts have data.
  const studentIds: Record<string, string> = { "student@demo.com": student.id };
  for (const name of "alice bob carol dana erin".split(" ")) {
    const email = `${name}@demo.com`;
    const created = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name: name[0].toUpperCase() + name.slice(1), email, passwordHash, role: "STUDENT" },
    });
    studentIds[email] = created.id;
  }

  // ── Categories: a fixed, curated taxonomy ──────────────────
  const categoryData = [
    { name: "Web Development", slug: "web-development" },
    { name: "Data Science", slug: "data-science" },
    { name: "DevOps", slug: "devops" },
    { name: "Design", slug: "design" },
    { name: "Marketing", slug: "marketing" },
  ];
  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const record = await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    categories[cat.slug] = record.id;
  }

  // ── The teacher's catalog: 8 courses, 26 lessons across 5
  //    categories. Declared as data; add one array entry to add
  //    a course. The main student is enrolled in every one. ──
  const courses: SeedCourse[] = [
    {
      id: "course-intro-nextjs",
      title: "Introduction to Next.js",
      description: "Learn the fundamentals of Next.js: routing, server components, and server actions.",
      categorySlug: "web-development",
      price: 0,
      lessons: [
        { id: "lesson-routing", title: "File-based Routing", order: 1, content: "In Next.js, the folder structure inside `app/` is the URL structure. Each folder with a `page.tsx` becomes a route." },
        { id: "lesson-app-router", title: "The App Router", order: 2, content: "Layouts, pages, and loading states — how the App Router composes your UI from the filesystem." },
        { id: "lesson-server-components", title: "Server Components", order: 3, content: "Why rendering on the server by default means less JavaScript shipped to the browser." },
        { id: "lesson-server-actions", title: "Server Actions", order: 4, content: "Mutations that run on the server without building a separate API route." },
      ],
    },
    {
      id: "course-react-essentials",
      title: "React Essentials",
      description: "Master React components, hooks, and state — the practical way. Paid course for testing checkout.",
      categorySlug: "web-development",
      price: 4900, // $49.00
      lessons: [
        { id: "lesson-react-hooks", title: "Thinking in Hooks", order: 1, content: "Hooks let you use React state and lifecycle features from function components." },
        { id: "lesson-react-state", title: "State & Effects", order: 2, content: "State is data that changes over time; effects sync your component with the outside world." },
        { id: "lesson-react-events", title: "Events & Forms", order: 3, content: "Controlled inputs, event handlers, and form state that stays in sync." },
        { id: "lesson-react-data", title: "Fetching Data", order: 4, content: "Loading remote data with effects, and the patterns that avoid race conditions." },
      ],
    },
    {
      id: "course-sql-basics",
      title: "SQL Fundamentals",
      description: "Query databases with confidence: SELECT, JOINs, aggregation, and indexes.",
      categorySlug: "data-science",
      price: 0,
      lessons: [
        { id: "lesson-sql-select", title: "SELECT & WHERE", order: 1, content: "The anatomy of a query: select columns, filter rows, order results." },
        { id: "lesson-sql-joins", title: "JOINs & Relations", order: 2, content: "Combining tables with INNER and LEFT JOINs to answer relational questions." },
        { id: "lesson-sql-aggregation", title: "Aggregation & Indexes", order: 3, content: "GROUP BY, HAVING, and why indexes make queries fast." },
      ],
    },
    {
      id: "course-python-data",
      title: "Python for Data Analysis",
      description: "From raw data to insights with Python, pandas, and plotting.",
      categorySlug: "data-science",
      price: 3900, // $39.00
      lessons: [
        { id: "lesson-python-basics", title: "Python Basics", order: 1, content: "Variables, lists, and comprehensions — the building blocks of data work." },
        { id: "lesson-python-pandas", title: "Pandas DataFrames", order: 2, content: "Loading, filtering, and reshaping tabular data with pandas." },
        { id: "lesson-python-viz", title: "Visualization", order: 3, content: "Turning numbers into charts that tell a clear story." },
      ],
    },
    {
      id: "course-docker-101",
      title: "Docker Basics",
      description: "Containerize any app: images, containers, volumes, and docker-compose.",
      categorySlug: "devops",
      price: 0,
      lessons: [
        { id: "lesson-docker-images", title: "Images vs Containers", order: 1, content: "An image is the template; a container is a running instance of it." },
        { id: "lesson-docker-compose", title: "Docker Compose", order: 2, content: "Declaring multi-service apps in one YAML file with compose." },
        { id: "lesson-docker-volume", title: "Volumes & Networking", order: 3, content: "Persisting data with volumes and wiring containers onto a network." },
      ],
    },
    {
      id: "course-ci-cd",
      title: "CI/CD with GitHub Actions",
      description: "Automate test, build, and deploy with GitHub Actions workflows.",
      categorySlug: "devops",
      price: 2900, // $29.00
      lessons: [
        { id: "lesson-ci-workflows", title: "Workflow Basics", order: 1, content: "Triggers, jobs, and steps — the anatomy of a workflow file." },
        { id: "lesson-ci-matrix", title: "Jobs & Matrix", order: 2, content: "Running the same job across many versions with a build matrix." },
        { id: "lesson-ci-deploy", title: "Deploying", order: 3, content: "Shipping artifacts to a host from a green build." },
      ],
    },
    {
      id: "course-ux-design",
      title: "UI/UX Fundamentals",
      description: "Design interfaces people can actually use: research, wireframes, and testing.",
      categorySlug: "design",
      price: 2400, // $24.00
      lessons: [
        { id: "lesson-ux-research", title: "User Research", order: 1, content: "Interviews and personas that ground your design in real needs." },
        { id: "lesson-ux-wireframe", title: "Wireframing", order: 2, content: "Low-fidelity layouts that settle structure before visual polish." },
        { id: "lesson-ux-usability", title: "Usability Testing", order: 3, content: "Watching real users to find the friction you can't see yourself." },
      ],
    },
    {
      id: "course-growth-marketing",
      title: "Growth Marketing",
      description: "Acquire and retain users with SEO, social, and email channels.",
      categorySlug: "marketing",
      price: 1900, // $19.00
      lessons: [
        { id: "lesson-marketing-seo", title: "SEO Basics", order: 1, content: "How search engines rank pages and what you can influence." },
        { id: "lesson-marketing-social", title: "Social Channels", order: 2, content: "Matching platform strengths to your audience's behavior." },
        { id: "lesson-marketing-email", title: "Email Campaigns", order: 3, content: "Segments, subject lines, and flows that convert." },
      ],
    },
  ];

  /** Upsert a course and its lessons, reusing the seeded teacher and
   * category. */
  const upsertCourse = async ({ id, title, description, categorySlug, price, lessons }: SeedCourse) => {
    const course = await prisma.course.upsert({
      where: { id },
      update: { categoryId: categories[categorySlug], price },
      create: { id, title, description, price, published: true, categoryId: categories[categorySlug], teacherId: teacher.id },
    });
    for (const lesson of lessons) {
      await prisma.lesson.upsert({ where: { id: lesson.id }, update: {}, create: { ...lesson, courseId: course.id } });
    }
    return course;
  };

  for (const data of courses) await upsertCourse(data);

  const lesson1 = await prisma.lesson.findUnique({ where: { id: "lesson-routing" } });
  if (!lesson1) throw new Error("Seeded lesson missing");

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

  // ── Enrollments: the main student is in every course; the extras
  //    add a few each, spread over ~60 days for the growth chart. ──
  // format: [student email, course id, days ago]
  const enrollments: Array<[string, string, number]> = [
    // Demo student — enrolled in all 8 courses, staggered
    ["student@demo.com", "course-intro-nextjs", 58],
    ["student@demo.com", "course-react-essentials", 48],
    ["student@demo.com", "course-sql-basics", 40],
    ["student@demo.com", "course-python-data", 30],
    ["student@demo.com", "course-docker-101", 22],
    ["student@demo.com", "course-ci-cd", 15],
    ["student@demo.com", "course-ux-design", 8],
    ["student@demo.com", "course-growth-marketing", 3],
    // Extra students — a handful of enrollments each
    ["alice@demo.com", "course-react-essentials", 55],
    ["alice@demo.com", "course-sql-basics", 42],
    ["alice@demo.com", "course-python-data", 20],
    ["alice@demo.com", "course-ux-design", 10],
    ["bob@demo.com", "course-docker-101", 38],
    ["bob@demo.com", "course-ci-cd", 25],
    ["bob@demo.com", "course-intro-nextjs", 14],
    ["carol@demo.com", "course-growth-marketing", 34],
    ["carol@demo.com", "course-sql-basics", 12],
    ["carol@demo.com", "course-python-data", 5],
    ["dana@demo.com", "course-react-essentials", 28],
    ["dana@demo.com", "course-docker-101", 9],
    ["dana@demo.com", "course-ci-cd", 2],
    ["erin@demo.com", "course-sql-basics", 45],
    ["erin@demo.com", "course-growth-marketing", 18],
  ];

  for (const [email, courseId, days] of enrollments) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: studentIds[email], courseId } },
      update: {},
      create: { userId: studentIds[email], courseId, createdAt: daysAgo(days) },
    });
  }

  // Demo student has actually done some work, so completion stats
  // aren't all zeros.
  for (const [lessonId, completedDaysAgo] of [
    ["lesson-routing", 20],
    ["lesson-react-hooks", 10],
    ["lesson-sql-select", 4],
  ] as Array<[string, number]>) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: student.id, lessonId } },
      update: {},
      create: { userId: student.id, lessonId, completedAt: daysAgo(completedDaysAgo) },
    });
  }

  const quiz1 = await prisma.quiz.findUnique({ where: { lessonId: lesson1.id } });
  if (quiz1) {
    await prisma.quizAttempt.upsert({
      where: { id: "attempt-demo-routing" },
      update: {},
      create: { id: "attempt-demo-routing", userId: student.id, quizId: quiz1.id, score: 2, answers: { q1: 1, q2: 2 }, createdAt: daysAgo(20) },
    });
  }

  console.log("Seeded demo data:");
  console.log("  teacher@demo.com / password123  (8 courses, 26 lessons)");
  console.log("  student@demo.com / password123  (enrolled in all 8)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
