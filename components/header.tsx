import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileMenu } from "@/components/mobile-menu";
import { Caveat } from "next/font/google";

const logoFont = Caveat({ subsets: ["latin"], weight: ["700"] });

const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

export async function Header() {
  const session = await auth();
  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";
  const isTeacher = session?.user?.role === "TEACHER";

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Canvas home" className="flex items-center">
          <span className={`text-3xl font-bold tracking-tighter text-foreground ${logoFont.className}`}>
            Canvas.
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 sm:flex">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-3 border-l border-border pl-6">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                  aria-label={`Signed in as ${session.user.name ?? "user"}`}
                >
                  {initial}
                </span>
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-surface transition-colors hover:bg-foreground/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 sm:hidden">
          {!session?.user && (
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-surface transition-colors hover:bg-foreground/90"
            >
              Sign up
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}