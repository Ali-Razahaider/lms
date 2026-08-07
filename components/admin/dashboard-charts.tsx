"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type {
  EnrollmentSeriesPoint,
  CourseBar,
  RevenueBar,
  CategorySlice,
} from "@/lib/admin-stats";

const PALETTE = ["#1e40af", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];
const AXIS_TICK = { fontSize: 12, fill: "#64748b" };
const GRID = { strokeDasharray: "3 3", stroke: "#e2e8f0", vertical: false };
const MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string }>;
  label?: string;
  format?: (value: number | string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-muted">
          {entry.name && <span className="mr-1">{entry.name}:</span>}
          <span className="font-semibold text-foreground">
            {format ? format(entry.value ?? 0) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`animate-rise rounded-2xl border border-border bg-surface p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** The two bar charts share everything except the data key, color,
 * and whether values render as money. */
function BarChartCard({
  title,
  subtitle,
  data,
  dataKey,
  name,
  color,
  money,
}: {
  title: string;
  subtitle: string;
  data: Array<{ course: string; students?: number; revenue?: number }>;
  dataKey: "students" | "revenue";
  name: string;
  color: string;
  money?: boolean;
}) {
  const formatMoney = (v: number | string) => currency.format(Number(v) / 100);
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={MARGIN}>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="course" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={money ? 56 : 32} allowDecimals={false} tickFormatter={money ? formatMoney : undefined} />
          <Tooltip content={<ChartTooltip format={money ? formatMoney : undefined} />} cursor={{ fill: "#f1f5f9" }} />
          <Bar dataKey={dataKey} name={name} fill={color} radius={[6, 6, 0, 0]} animationDuration={900} animationEasing="ease-out" maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DashboardCharts({
  enrollmentSeries,
  courseBars,
  revenueBars,
  categorySlices,
}: {
  enrollmentSeries: EnrollmentSeriesPoint[];
  courseBars: CourseBar[];
  revenueBars: RevenueBar[];
  categorySlices: CategorySlice[];
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <ChartCard title="Enrollment growth" subtitle="Cumulative students over the last 60 days" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={enrollmentSeries} margin={MARGIN}>
            <defs>
              <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e40af" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1e40af" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#1e40af", strokeDasharray: "4 4" }} />
            <Area type="monotone" dataKey="count" name="Students" stroke="#1e40af" strokeWidth={2.5} fill="url(#enrollFill)" animationDuration={900} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <BarChartCard title="Students per course" subtitle="Active enrollments by course" data={courseBars} dataKey="students" name="Students" color="#1e40af" />
      <BarChartCard title="Revenue by course" subtitle="Total paid enrollments (test mode)" data={revenueBars} dataKey="revenue" name="Revenue" color="#10b981" money />

      <ChartCard title="Enrollments by category" subtitle="Where your students are learning" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={categorySlices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={96}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {categorySlices.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13, color: "#64748b" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
