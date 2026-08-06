import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { MobileMenu } from "@/components/mobile-menu";

const nav = [
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

export async function Header() {
  const session = await auth();
  const initial = session?.user?.name?.charAt(0).toUpperCase() ?? "U";
  const isTeacher = session?.user?.role === "TEACHER";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Lume home" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white">
            L
          </span>
          <span className="text-[17px] font-semibold tracking-tight">Lume</span>
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
              {isTeacher && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Admin
                </Link>
              )}
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                aria-label={`Signed in as ${session.user.name ?? "user"}`}
              >
                {initial}
              </span>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <SignOutButton />
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
                className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          {!session?.user && (
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Get started
            </Link>
          )}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}