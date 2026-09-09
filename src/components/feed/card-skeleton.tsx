/** Placeholder with the exact geometry of a regret card, to avoid a jump. */
export function CardSkeleton() {
  return (
    <div className="bg-field-alt h-[400px] w-full animate-pulse rounded-[25px]">
      <div className="flex items-center gap-[12px] px-[11px] pt-[10px]">
        <div className="size-[35px] rounded-full bg-white/10" />
        <div className="flex flex-col gap-[6px]">
          <div className="h-[10px] w-[120px] rounded bg-white/10" />
          <div className="h-[8px] w-[40px] rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
