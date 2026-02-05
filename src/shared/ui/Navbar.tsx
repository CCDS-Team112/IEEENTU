import Link from "next/link";
import { A11yToolbar } from "@/features/accessibility/ui/A11yToolbar";
import { signOut } from "@/features/auth/application/signOut";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

export function Navbar(props: {
  session: { name: string; role: "USER" | "ADMIN" } | null;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-[color:var(--border)] bg-[color:var(--bg)]",
        props.className,
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <nav aria-label="Primary" className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-lg text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
          >
            Access Starter
          </Link>
          {props.session ? (
            <Link
              href="/home"
              className="rounded-lg text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              Home
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg text-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]"
            >
              Log in
            </Link>
          )}
        </nav>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <A11yToolbar />
          {props.session ? (
            <form action={signOut}>
              <Button type="submit" variant="secondary">
                Sign out ({props.session.role})
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}

