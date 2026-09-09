import { CardSkeleton } from "@/components/feed/card-skeleton";

export default function FeedLoading() {
  return (
    <div className="mx-auto flex w-full max-w-[599px] flex-col gap-[10px] px-3 pb-[140px] pt-[10px] sm:px-0 sm:pb-[180px]">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
