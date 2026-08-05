import { signOutAction } from "@/lib/actions/sign-out";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-lg text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        Sign out
      </button>
    </form>
  );
}