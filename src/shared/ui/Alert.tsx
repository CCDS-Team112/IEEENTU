import { cn } from "@/shared/lib/cn";

export function Alert(
  props: React.HTMLAttributes<HTMLDivElement> & { variant?: "error" | "info" },
) {
  const { className, variant = "info", ...rest } = props;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      {...rest}
      className={cn(
        "rounded-xl border p-3 text-sm",
        variant === "error" &&
          "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10",
        variant === "info" &&
          "border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--fg)]",
        className,
      )}
    />
  );
}

