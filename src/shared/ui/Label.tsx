import { cn } from "@/shared/lib/cn";

export function Label(props: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("text-sm font-semibold text-foreground", props.className)}
    />
  );
}
