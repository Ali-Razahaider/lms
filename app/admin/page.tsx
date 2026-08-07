import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";
import { getAdminStats } from "@/lib/admin-stats";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function AdminOverviewPage() {
  await requireTeacher();

  const [stats, categoryCount] = await Promise.all([
    getAdminStats(),
    prisma.category.count(),
  ]);

  const statsCards = [
    { label: "Total users", value: stats.userCount, href: "/admin/users" },
    { label: "Students", value: stats.studentCount, href: "/admin/users" },
    { label: "Courses", value: stats.courseCount, href: "/admin/courses" },
    { label: "Published", value: stats.publishedCount, href: "/admin/courses" },
    { label: "Enrollments", value: stats.enrollmentCount },
    {
      label: "Revenue",
      value: currency.format(stats.revenueTotal / 100),
      hint: `across ${stats.revenueBars.length} paid course(s)`,
    },
    { label: "Categories", value: categoryCount },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, i) => {
          const inner = (
            <div
              className="animate-rise rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <p className="text-sm font-medium text-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{stat.value}</p>
              {stat.hint && <p className="mt-1 text-xs text-muted">{stat.hint}</p>}
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      <DashboardCharts
        enrollmentSeries={stats.enrollmentSeries}
        courseBars={stats.courseBars}
        revenueBars={stats.revenueBars}
        categorySlices={stats.categorySlices}
      />
    </div>
  );
}
