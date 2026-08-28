import Link from "next/link";
import { auth } from "@/lib/auth";
import LottieAnimation from "@/components/lottie-animation";
import Reveal from "@/components/reveal";
import { StructuredCoursesIllustration, ProgressTrackingIllustration, QuizzesIllustration } from "@/components/feature-illustrations";
import { StepCreateAccountIllustration, StepPickCourseIllustration, StepLearnTestIllustration } from "@/components/step-illustrations";

const features = [
  {
    title: "Structured courses",
    body: "Learn through a carefully ordered path of lessons — never wonder what to do next.",
    illustration: <StructuredCoursesIllustration />,
  },
  {
    title: "Progress you can see",
    body: "Track exactly where you are in every course and pick up where you left off.",
    illustration: <ProgressTrackingIllustration />,
  },
  {
    title: "Quizzes that stick",
    body: "Test yourself after every lesson with instant feedback and a running score.",
    illustration: <QuizzesIllustration />,
  },
];

const steps = [
  {
    number: "01",
    title: "Create an account",
    body: "Sign up as a student or teacher in under a minute.",
    illustration: <StepCreateAccountIllustration />,
  },
  {
    number: "02",
    title: "Pick a course",
    body: "Browse the catalog and enroll in whatever interests you.",
    illustration: <StepPickCourseIllustration />,
  },
  {
    number: "03",
    title: "Learn and test",
    body: "Work through lessons and lock in knowledge with quizzes.",
    illustration: <StepLearnTestIllustration />,
  },
];

const stats = [
  { value: "Self-paced", label: "Learn on your own schedule" },
  { value: "One clear path", label: "Never wonder what to study next" },
  { value: "Practice built in", label: "A quick check after every lesson" },
  { value: "Your progress", label: "Pick up right where you left off" },
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
          <h1 className="hero-h1 text-balance font-black">
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

        <div className="relative flex items-center justify-center">
          <LottieAnimation />
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
             {features.map((feature, i) => (
               <Reveal key={feature.title} delay={i * 0.08}>
                 <div
                   className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
                 >
                   <div className="relative h-48 w-full bg-surface border-b border-border/50">
                     {feature.illustration}
                   </div>
                   <div className="p-6">
                     <h3 className="text-lg font-semibold">{feature.title}</h3>
                     <p className="mt-2 leading-relaxed text-muted">
                       {feature.body}
                     </p>
                   </div>
                 </div>
               </Reveal>
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
             {steps.map((step, i) => (
               <Reveal key={step.number} delay={i * 0.08}>
                 <div className="relative flex h-full flex-col group">
                   <div className="h-32 mb-6 w-full rounded-2xl bg-primary-soft/30 overflow-hidden relative border border-border/40">
                     <div className="absolute top-4 left-6 text-7xl font-bold text-primary/5 select-none pointer-events-none font-sans z-0">
                       {step.number}
                     </div>
                     <div className="absolute inset-0 z-10">
                       {step.illustration}
                     </div>
                   </div>
                   <h3 className="text-lg font-semibold">{step.title}</h3>
                   <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                 </div>
               </Reveal>
             ))}
           </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Learning at a glance" className="bg-bg-subtle">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 text-center sm:grid-cols-4 sm:px-6">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div>
                <p className="text-4xl font-semibold text-primary">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            </Reveal>
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