export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-surface font-poppins flex flex-1 justify-center overflow-y-auto p-4">
      {/*
        auto margins centre the card without clipping its top on short screens.
        The width is explicit: the card sizes itself with w-full, which would
        otherwise resolve against a shrink-to-fit wrapper and collapse.
      */}
      <div className="m-auto w-full max-w-[520px]">{children}</div>
    </main>
  );
}
