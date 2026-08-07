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

const PALETTE = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"];
const AXIS_TICK = { fontSize: 12, fill: "#94a3b8", fontWeight: 500 };
const GRID = { strokeDasharray: "4 4", stroke: "#f1f5f9", vertical: false };
const MARGIN = { top: 10, right: 10, left: 0, bottom: 0 };
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
    <div className={`animate-rise flex flex-col rounded-[2rem] border border-border bg-surface p-6 shadow-sm ${className}`}>
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm font-medium text-muted">{subtitle}</p>
      </div>
      <div className="mt-6 flex-1">{children}</div>
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
  const gradId = `fill-${dataKey}`;
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 45 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID} />
          <XAxis dataKey="course" tick={{ ...AXIS_TICK }} angle={-35} textAnchor="end" dx={-5} dy={5} tickLine={false} axisLine={false} interval={0} tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)} height={50} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={money ? 56 : 32} allowDecimals={false} tickFormatter={money ? formatMoney : undefined} />
          <Tooltip content={<ChartTooltip format={money ? formatMoney : undefined} />} cursor={{ fill: "#f8fafc" }} />
          <Bar dataKey={dataKey} name={name} fill={`url(#${gradId})`} radius={[8, 8, 0, 0]} animationDuration={1000} animationEasing="ease-out" maxBarSize={40} />
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
    <div className="mt-6 flex flex-col gap-8">
      <ChartCard title="Enrollment growth" subtitle="Cumulative students over the last 60 days">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={enrollmentSeries} margin={MARGIN}>
            <defs>
              <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={28} dy={10} height={30} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#0ea5e9", strokeDasharray: "4 4" }} />
            <Area type="monotone" dataKey="count" name="Students" stroke="#0ea5e9" strokeWidth={3} fill="url(#enrollFill)" animationDuration={1000} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <BarChartCard title="Students per course" subtitle="Active enrollments by course" data={courseBars} dataKey="students" name="Students" color="#8b5cf6" />
    </div>
  );
}
