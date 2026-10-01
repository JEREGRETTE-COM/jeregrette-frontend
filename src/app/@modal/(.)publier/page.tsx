import { RegretComposer } from "@/components/compose/regret-composer";
import { Dialog } from "@/components/ui/dialog";

/**
 * Intercepts /publier on client navigation and shows the composer over the
 * feed. Opening the URL directly, or refreshing, still renders the full page.
 */
export default function ComposeDialogPage() {
  return (
    <Dialog label="Publier un regret">
      <RegretComposer inDialog />
    </Dialog>
  );
}
