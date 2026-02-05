import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  },
) {
  const { className, variant = "primary", size = "default", ...rest } = props;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full border text-sm font-semibold transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "min-h-11 px-5",
        size === "sm" && "min-h-9 px-4 text-xs",
        size === "lg" && "min-h-12 px-6 text-base",
        variant === "primary" &&
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:opacity-90",
        variant === "secondary" &&
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "outline" &&
          "border-border bg-background text-foreground hover:bg-accent",
        variant === "ghost" &&
          "border-transparent bg-transparent text-foreground hover:bg-accent",
        "motion-reduce:transition-none",
        className,
      )}
      {...rest}
    />
  );
}
