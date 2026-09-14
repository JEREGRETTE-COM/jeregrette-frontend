import { CardSkeleton } from "@/components/feed/card-skeleton";

export default function ProfileLoading() {
  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
      <header className="h-[70px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
        <div className="mx-auto flex h-full w-full max-w-[599px] items-center gap-[16px] px-[25px]">
          <div className="size-[35px] shrink-0 rounded-full bg-white/10" />
          <p className="text-[16px] text-white">Profil</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[599px] animate-pulse flex-col px-[25px] pb-[140px]">
        <div className="mx-auto size-[75px] rounded-full bg-white/10" />
        <div className="mx-auto mt-[11px] h-[16px] w-[180px] rounded bg-white/10" />
        <div className="mx-auto mt-[14px] h-[36px] w-[60px] rounded bg-white/10" />
        <div className="mx-auto mt-[15px] h-[14px] w-[260px] rounded bg-white/10" />
        <div className="mt-[20px] h-[14px] w-[140px] rounded bg-white/10" />
        <div className="mt-[20px] flex flex-col gap-[10px]">
          <CardSkeleton />
        </div>
      </div>
    </main>
  );
}
