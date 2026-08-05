import Link from "next/link";
import { auth } from "@/lib/auth";

const features = [
  {
    title: "Structured courses",
    body: "Learn through a carefully ordered path of lessons — never wonder what to do next.",
  },
  {
    title: "Progress you can see",
    body: "Track exactly where you are in every course and pick up where you left off.",
  },
  {
    title: "Quizzes that stick",
    body: "Test yourself after every lesson with instant feedback and a running score.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an account",
    body: "Sign up as a student or teacher in under a minute.",
  },
  {
    number: "02",
    title: "Pick a course",
    body: "Browse the catalog and enroll in whatever interests you.",
  },
  {
    number: "03",
    title: "Learn and test",
    body: "Work through lessons and lock in knowledge with quizzes.",
  },
];

const stats = [
  { value: "7", label: "Courses & lessons" },
  { value: "5", label: "Minutes to start" },
  { value: "100%", label: "Progress tracked" },
  { value: "24/7", label: "Learn anytime" },
];

export default async function Home() {
  const session = await auth();
  const target = session?.user ? "/dashboard" : "/register";

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, #eff6ff 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary">
            Modern · Interactive · Built for you
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Learn at your own pace,{" "}
            <span className="text-primary">master your craft.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            A focused, distraction-free way to take courses, follow lessons, and
            test what you know. Built for real learning.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={target}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              {session?.user ? "Go to dashboard" : "Start learning"}
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-surface px-6 text-base font-medium transition-colors hover:bg-primary-soft"
            >
              Browse courses
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <span aria-hidden>📘</span>
              </span>
              <div>
                <p className="font-semibold">React Foundations</p>
                <p className="text-sm text-muted">Module 3 · Components</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Lesson 14 of 24</span>
                <span className="text-primary">58%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full w-[58%] rounded-full bg-primary" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary-soft p-4">
              <span className="text-primary">✓</span>
              <p className="text-sm font-medium text-primary">
                Great work — lesson complete!
              </p>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-4 hidden rounded-2xl border border-border bg-surface p-4 shadow-lg sm:block">
            <p className="text-xs font-medium text-muted">Quiz score</p>
            <p className="text-2xl font-semibold text-primary">92%</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        aria-labelledby="features-heading"
        className="border-t border-border bg-bg-subtle"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2
              id="features-heading"
              className="text-3xl font-semibold tracking-tight"
            >
              Everything you need to learn well
            </h2>
            <p className="mt-3 text-lg text-muted">
              Thoughtful, deliberate features — nothing that gets in the way.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
              >
                <div className="mb-4 h-1.5 w-8 rounded-full bg-primary" />
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="max-w-2xl">
            <h2 id="how-heading" className="text-3xl font-semibold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-lg text-muted">
              Three simple steps between you and your next skill.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="text-5xl font-semibold text-primary-soft">
                  {step.number}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Platform stats" className="bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 text-center sm:grid-cols-4 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-semibold text-primary">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="cta-heading" className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Ready to start learning?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            Create your free account and begin your first course today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={target}
              className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              {session?.user ? "Go to dashboard" : "Start learning"}
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-11 items-center rounded-xl border border-border bg-surface px-6 text-base font-medium transition-colors hover:bg-primary-soft"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}