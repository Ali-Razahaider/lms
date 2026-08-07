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
    { label: "Total users", value: stats.userCount },
    { label: "Students", value: stats.studentCount },
    { label: "Courses", value: stats.courseCount },
    { label: "Published", value: stats.publishedCount },
    { label: "Enrollments", value: stats.enrollmentCount },
    {
      label: "Revenue",
      value: currency.format(stats.revenueTotal / 100),
      hint: `across ${stats.revenueBars.length} paid course(s)`,
    },
    { label: "Categories", value: categoryCount },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Charts at the top */}
      <div className="-mt-6">
        <DashboardCharts
          enrollmentSeries={stats.enrollmentSeries}
          courseBars={stats.courseBars}
          revenueBars={stats.revenueBars}
          categorySlices={stats.categorySlices}
        />
      </div>

      {/* 2. Stats grid below */}
      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Quick Stats</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4">
          {statsCards.map((stat, i) => (
            <div
              key={stat.label}
              className="group animate-rise rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <p className="text-xs font-bold tracking-wider text-muted uppercase">{stat.label}</p>
              <p className="mt-1 text-3xl font-black tracking-tighter text-foreground">{stat.value}</p>
              {stat.hint && <p className="mt-1 text-xs font-medium text-muted/80">{stat.hint}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
