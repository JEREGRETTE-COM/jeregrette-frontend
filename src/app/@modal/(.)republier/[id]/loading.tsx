import { Dialog } from "@/components/ui/dialog";

/** The post is fetched before the dialog can render; show its frame at once. */
export default function RepostDialogLoading() {
  return (
    <Dialog label="Republier">
      <div className="bg-surface flex min-h-[560px] w-full animate-pulse flex-col rounded-[25px] p-[25px] sm:min-h-[705px]">
        <div className="ml-auto h-[35px] w-[104px] rounded-[10px] bg-white/10" />
        <div className="mt-[20px] h-[35px] w-[160px] rounded-full bg-white/10" />
        <div className="mt-[14px] h-[118px] w-full rounded-[15px] bg-white/10" />
        <div className="mt-auto h-[369px] w-full rounded-[15px] bg-white/10" />
      </div>
    </Dialog>
  );
}
