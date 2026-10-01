/** Same box as the composer, so opening the dialog does not jump. */
export default function ComposeDialogLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-field-alt h-[560px] w-full max-w-[520px] animate-pulse rounded-[25px] sm:h-[705px]" />
    </div>
  );
}
