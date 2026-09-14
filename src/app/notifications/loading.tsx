export default function NotificationsLoading() {
  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
      <header className="h-[70px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
        <div className="mx-auto flex h-full w-full max-w-[599px] items-center gap-[16px] px-[25px]">
          <div className="size-[35px] shrink-0 rounded-full bg-white/10" />
          <p className="text-[16px] text-white">Notifications</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[599px] animate-pulse flex-col gap-[8px] px-[25px] pt-[12px]">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="bg-row h-[59px] rounded-[10px]" />
        ))}
      </div>
    </main>
  );
}
