export default function AboutPage() {
  const features = [
    {
      title: "Courses & modules",
      body: "Structured learning content built from reusable lessons.",
    },
    {
      title: "Progress tracking",
      body: "See exactly where you are in every course and pick up where you left off.",
    },
    {
      title: "Quizzes",
      body: "Test what you've learned with instant feedback on every answer.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <span className="text-sm font-medium text-primary">About Lume</span>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
        A learning platform built on modern web fundamentals.
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">
        Lume is built with Next.js, Prisma, and PostgreSQL — a clean, modern
        stack chosen to make learning simple, fast, and fun.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="mb-3 h-1.5 w-8 rounded-full bg-primary" />
            <h2 className="font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}