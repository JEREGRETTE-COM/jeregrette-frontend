import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { RepostComposer } from "@/components/repost/repost-composer";
import { getCurrentAuthor } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth";
import { toRegret } from "@/lib/feed-mapping";
import { getPost } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Republier",
};

export default async function RepostPage({ params }: PageProps<"/republier/[id]">) {
  const author = await getCurrentAuthor();
  if (!author) redirect("/inscription");

  const { id } = await params;
  const token = await getAccessToken();
  const post = token ? await getPost(id, token).catch(() => null) : null;
  if (!post) notFound();
  const regret = toRegret(post);

  return <RepostComposer regret={regret} author={author} />;
}
