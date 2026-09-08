import { cn } from "@/lib/utils";

type AuthFieldProps = React.ComponentProps<"input"> & {
  id: string;
  label: string;
  className?: string;
};

/**
 * Pill input with an overlaid label — a plain placeholder cannot carry the
 * red asterisk from the design, so the label is hidden on focus/typing.
 */
export function AuthField({ id, label, className, ...props }: AuthFieldProps) {
  return (
    <div className={cn("relative h-[50px] shrink-0", className)}>
      <input
        id={id}
        required
        placeholder=" "
        className="bg-field peer h-full w-full rounded-[25px] px-5 text-[15px] font-light text-white outline-none placeholder:text-transparent"
        {...props}
      />
      <label
        htmlFor={id}
        className="text-muted pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[14px] font-light peer-focus:hidden peer-[:not(:placeholder-shown)]:hidden"
      >
        {label}
        <span className="text-required">*</span>
      </label>
    </div>
  );
}
