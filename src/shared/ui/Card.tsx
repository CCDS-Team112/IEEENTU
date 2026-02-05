import { cn } from "@/shared/lib/cn";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "glass-panel rounded-3xl border border-border p-6 shadow-[0_15px_40px_-32px_rgba(15,23,42,0.45)]",
        props.className,
      )}
    />
  );
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...props} className={cn("text-xl font-semibold", props.className)} />
  );
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={cn("mt-2 text-sm text-muted-foreground", props.className)}
    />
  );
}
