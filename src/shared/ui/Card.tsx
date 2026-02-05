import { cn } from "@/shared/lib/cn";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] p-6 shadow-sm",
        props.className,
      )}
    />
  );
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={cn("text-xl font-semibold", props.className)}
    />
  );
}

export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={cn("mt-2 text-[color:var(--fg)]/90", props.className)}
    />
  );
}

