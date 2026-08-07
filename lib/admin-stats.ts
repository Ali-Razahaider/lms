import { prisma } from "@/lib/prisma";

const DAY_MS = 86_400_000;
const SERIES_WINDOW_DAYS = 60;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type EnrollmentSeriesPoint = { date: string; count: number };
export type CourseBar = { course: string; students: number };
export type RevenueBar = { course: string; revenue: number };
export type CategorySlice = { name: string; value: number };

export type AdminStats = {
  userCount: number;
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  publishedCount: number;
  enrollmentCount: number;
  revenueTotal: number; // in cents
  enrollmentSeries: EnrollmentSeriesPoint[];
  courseBars: CourseBar[];
  revenueBars: RevenueBar[];
  categorySlices: CategorySlice[];
};

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function shortDate(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Load everything the overview needs in as few queries as possible.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [userCount, studentCount, teacherCount, courseCount, publishedCount, enrollments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.course.count(),
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.findMany({
        select: {
          createdAt: true,
          course: {
            select: {
              title: true,
              price: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

  // ── Enrollment growth: cumulative count per day, last 60 days ──
  const seriesMap = new Map<string, number>();
  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);
  for (let i = SERIES_WINDOW_DAYS - 1; i >= 0; i--) {
    const day = new Date(windowStart.getTime() - i * DAY_MS);
    seriesMap.set(dateKey(day), 0);
  }
  for (const { createdAt } of enrollments) {
    if (createdAt.getTime() < windowStart.getTime() - SERIES_WINDOW_DAYS * DAY_MS) continue;
    const key = dateKey(createdAt);
    if (seriesMap.has(key)) seriesMap.set(key, (seriesMap.get(key) ?? 0) + 1);
  }
  const enrollmentSeries: EnrollmentSeriesPoint[] = [];
  let running = 0;
  for (const [key, count] of seriesMap) {
    running += count;
    const [y, m, d] = key.split("-").map(Number);
    enrollmentSeries.push({ date: shortDate(new Date(y, m, d)), count: running });
  }

  // ── Students per course ──
  const byCourse = new Map<string, number>();
  for (const { course } of enrollments) {
    byCourse.set(course.title, (byCourse.get(course.title) ?? 0) + 1);
  }
  const courseBars: CourseBar[] = [...byCourse.entries()]
    .map(([course, students]) => ({ course, students }))
    .sort((a, b) => b.students - a.students);

  // ── Revenue per paid course (cents) ──
  const byRevenue = new Map<string, number>();
  for (const { course } of enrollments) {
    if (course.price <= 0) continue;
    byRevenue.set(course.title, (byRevenue.get(course.title) ?? 0) + course.price);
  }
  const revenueBars: RevenueBar[] = [...byRevenue.entries()]
    .map(([course, revenue]) => ({ course, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
  const revenueTotal = revenueBars.reduce((sum, r) => sum + r.revenue, 0);

  // ── Enrollments by category ──
  const byCategory = new Map<string, number>();
  for (const { course } of enrollments) {
    const name = course.category?.name ?? "Uncategorized";
    byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
  }
  const categorySlices: CategorySlice[] = [...byCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return {
    userCount,
    studentCount,
    teacherCount,
    courseCount,
    publishedCount,
    enrollmentCount: enrollments.length,
    revenueTotal,
    enrollmentSeries,
    courseBars,
    revenueBars,
    categorySlices,
  };
}
