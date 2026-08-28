"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users,
  CheckCircle2, 
  BarChart3, 
  BookOpen,
  Footprints,
  TrendingUp,
  Play
} from "lucide-react";

// --- Custom Illustrations (Homepage Style) ---

const RoleIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group rounded-2xl border border-border">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
    <div className="relative flex items-center justify-center w-full h-full p-4 gap-4">
      {/* Student Panel */}
      <motion.div 
        className="w-20 h-28 bg-white border border-border/60 rounded-xl shadow-sm p-2 flex flex-col gap-2 z-10"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="w-6 h-6 rounded-full bg-blue-500/20 mb-1" />
        <div className="h-2 w-full bg-border rounded-full" />
        <div className="h-2 w-3/4 bg-border rounded-full" />
      </motion.div>
      {/* Teacher Panel */}
      <motion.div 
        className="w-20 h-28 bg-white border border-border/60 rounded-xl shadow-sm p-2 flex flex-col gap-2 z-10"
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 mb-1 flex items-center justify-center">
           <Users size={12} className="text-indigo-500" />
        </div>
        <div className="h-2 w-full bg-indigo-500/10 rounded-full" />
        <div className="h-2 w-full bg-indigo-500/10 rounded-full" />
        <div className="h-2 w-1/2 bg-indigo-500/10 rounded-full" />
      </motion.div>
    </div>
  </div>
);

const VideoIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group rounded-2xl border border-border">
    <div className="absolute inset-0 bg-gradient-to-tl from-indigo-500/10 to-transparent" />
    <div className="relative flex items-center justify-center w-full h-full p-4">
      <motion.div 
        className="w-full max-w-[160px] aspect-video bg-white border border-border/60 rounded-xl shadow-sm relative overflow-hidden flex items-center justify-center"
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-slate-100" />
        <motion.div 
          className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center z-10 text-indigo-500"
          whileHover={{ scale: 1.1 }}
        >
          <Play size={16} className="ml-1" />
        </motion.div>
        {/* Timeline */}
        <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: "0%" }}
            whileInView={{ width: "60%" }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
      </motion.div>
    </div>
  </div>
);

const QuizIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group rounded-2xl border border-border">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent" />
    <div className="relative flex items-center justify-center w-full h-full p-4">
      <motion.div 
        className="w-full max-w-[140px] bg-white border border-border/60 rounded-xl shadow-sm p-3 flex flex-col gap-3"
        initial={{ x: -20, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <CheckCircle2 size={16} className={i === 3 ? "text-emerald-500/30" : "text-emerald-500"} />
            <div className={`h-2 rounded-full flex-1 ${i === 3 ? "bg-border" : "bg-emerald-500/20"}`} />
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);

const AnalyticsIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center bg-surface overflow-hidden group rounded-2xl border border-border">
    <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/10 to-transparent" />
    <div className="relative w-full h-full flex items-end justify-center gap-2 p-6 pb-4 pt-12">
      {[40, 70, 45, 90, 60].map((h, i) => (
        <motion.div
          key={i}
          className={`w-6 rounded-t-md ${i === 3 ? 'bg-amber-400' : 'bg-amber-400/30'}`}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, type: "spring" }}
        />
      ))}
      <motion.div
        className="absolute top-4 right-4 text-amber-500 bg-white p-2 rounded-lg shadow-sm border border-border/50"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <BarChart3 size={16} />
      </motion.div>
    </div>
  </div>
);

const features = [
  {
    title: "Learn at your own pace",
    description: "No fixed schedules or deadlines. Move through lessons when it suits you, and revisit anything whenever you like.",
    illustration: <RoleIllustration />,
  },
  {
    title: "Clear, focused lessons",
    description: "Short, well-structured videos and readings that teach one idea at a time — no filler, no fluff.",
    illustration: <VideoIllustration />,
  },
  {
    title: "Practice that sticks",
    description: "Each lesson ends with a quick check for understanding, so new ideas actually settle in.",
    illustration: <QuizIllustration />,
  },
  {
    title: "Watch yourself grow",
    description: "See your progress build lesson by lesson and stay motivated to keep going.",
    illustration: <AnalyticsIllustration />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 flex flex-col items-center text-center">
        {/* Soft Background Gradient like homepage */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] -z-10"
          aria-hidden
          style={{
            background: "radial-gradient(50% 50% at 50% 0%, var(--color-primary-soft) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary mb-6 border border-primary/10"
        >
          About Canvas
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hero-h1 text-balance max-w-4xl text-foreground"
        >
          A calm place to learn.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-xl leading-relaxed text-muted max-w-2xl mx-auto"
        >
          Canvas is built around one idea: learning should be clear, steady, and yours. We focus on well-made lessons, visible progress, and the small habits that make knowledge stick — nothing that gets in the way.
        </motion.p>
      </section>

      {/* Graphical Features Section (Like Homepage) */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-border/50">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">How Canvas helps you learn</h2>
          <p className="text-muted mt-2">Small, deliberate supports that keep you moving forward.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl bg-bg-subtle border border-border/60 hover:shadow-sm transition-shadow group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="w-full md:w-48 h-40 shrink-0">
                {feature.illustration}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted leading-relaxed text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning principles section */}
      <section className="px-6 py-24 max-w-6xl mx-auto border-t border-border/50">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Our approach to learning</h2>
          <p className="text-muted text-lg">The habits that turn lessons into lasting understanding — and how Canvas quietly supports each one.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 p-6 rounded-3xl bg-bg-subtle border border-border/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Learn by doing</h3>
            <p className="text-muted leading-relaxed text-sm">
              Watching isn&apos;t the same as knowing. Every lesson invites you to try it back — through a short check — before you move on.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-3xl bg-bg-subtle border border-border/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Footprints size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Small steps win</h3>
            <p className="text-muted leading-relaxed text-sm">
              One clear idea at a time beats cramming. Lessons are ordered so each builds on the last, and you always know what&apos;s next.
            </p>
          </div>

          <div className="flex flex-col gap-4 p-6 rounded-3xl bg-bg-subtle border border-border/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Progress you can see</h3>
            <p className="text-muted leading-relaxed text-sm">
              A visible path keeps motivation alive. Watch completion add up lesson by lesson and pick up exactly where you left off.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-6">Ready to start learning?</h2>
          <p className="text-lg text-muted mb-10 max-w-2xl mx-auto">
            Browse our catalog of courses, follow a clear path, and build real skills at your own pace.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              href="/courses" 
              className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Browse Courses
            </Link>
            <Link 
              href="/register" 
              className="inline-flex h-11 items-center rounded-xl border border-border bg-surface px-6 text-base font-medium transition-colors hover:bg-primary-soft"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}