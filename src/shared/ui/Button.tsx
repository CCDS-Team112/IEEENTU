import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
  },
) {
  const { className, variant = "primary", ...rest } = props;

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "border-transparent bg-[color:var(--primary)] text-[color:var(--primary-fg)]",
        variant === "secondary" &&
          "border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--fg)] hover:bg-[color:var(--muted)]",
        "motion-reduce:transition-none sm:transition-colors",
        className,
      )}
      {...rest}
    />
  );
}

