import Link from "next/link";
import { A11yToolbar } from "@/features/accessibility/ui/A11yToolbar";
import { signOut } from "@/features/auth/application/signOut";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/Button";

export function Navbar(props: {
  session: { name: string; role: "USER" | "ADMIN" | "DOCTOR" } | null;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur",
        props.className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            Careline
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
            {props.session ? (
              <>
                <Link
                  href="/home"
                  className="rounded-full px-3 py-1 font-medium text-foreground transition hover:bg-accent"
                >
                  Dashboard
                </Link>
                <Link
                  href="/health-records"
                  className="rounded-full px-3 py-1 font-medium text-foreground transition hover:bg-accent"
                >
                  Health Records
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-1 font-medium text-foreground transition hover:bg-accent"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-3 py-1 font-medium text-foreground transition hover:bg-accent"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <A11yToolbar />
          {props.session ? (
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {props.session.name}
              <span className="text-foreground">{props.session.role}</span>
            </div>
          ) : null}
          {props.session ? (
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Get started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
