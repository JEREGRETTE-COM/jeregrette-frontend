import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "primary" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-foreground text-background hover:opacity-90",
        variant === "outline" && "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
