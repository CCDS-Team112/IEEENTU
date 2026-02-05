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
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "error" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        variant === "info" && "border-border bg-muted text-foreground",
        className,
      )}
    />
  );
}
