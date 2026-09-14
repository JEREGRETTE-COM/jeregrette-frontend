import { notFound, redirect } from "next/navigation";

import { RepostComposer } from "@/components/repost/repost-composer";
import { Dialog } from "@/components/ui/dialog";
import { getAccessToken, getCurrentAuthor } from "@/lib/auth";
import { toRegret } from "@/lib/feed-mapping";
import { getPost } from "@/lib/posts";

/**
 * Intercepts /republier/[id] on client navigation and shows it over the current
 * page. Opening the URL directly or refreshing still renders the full page.
 */
export default async function RepostDialogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, author, token] = await Promise.all([
    params,
    getCurrentAuthor(),
    getAccessToken(),
  ]);
  if (!author || !token) redirect("/inscription");

  const post = await getPost(id, token).catch(() => null);
  if (!post) notFound();

  return (
    <Dialog label="Republier">
      <RepostComposer regret={toRegret(post)} author={author} inDialog />
    </Dialog>
  );
}
