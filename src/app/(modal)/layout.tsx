export default function ModalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-surface font-poppins flex flex-1 justify-center overflow-y-auto p-4">
      {/* auto margins centre the card without clipping its top on short screens */}
      <div className="m-auto">{children}</div>
    </main>
  );
}
