import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import { siteConfig } from "@/lib/config";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { toFeedItem } from "@/lib/feed-mapping";
import { getPost } from "@/lib/posts";
import type { FeedItem } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Reads with the viewer's own token: /posts/{id} is authenticated, so a signed
 * out visitor — a link preview crawler included — gets nothing.
 */
async function loadItem(id: string): Promise<FeedItem | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return toFeedItem(await getPost(id, token));
  } catch {
    return null;
  }
}

/** The quoted regret carries the picture and the words worth sharing. */
function regretOf(item: FeedItem) {
  return item.kind === "repost" ? item.repost.regret : item.regret;
}

export async function generateMetadata({
  params,
}: PageProps<"/regret/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await loadItem(id);
  if (!item) return { title: "Regret introuvable" };

  const regret = regretOf(item);
  const author = item.kind === "repost" ? item.repost.author : regret.author;
  const title = `${author.handle} sur ${siteConfig.name}`;
  const description = item.kind === "repost" && item.repost.comment
    ? `${item.repost.comment} — ${regret.text}`
    : regret.text;
  const image = {
    url: `/regret/${regret.id}/image`,
    width: 1080,
    height: 1080,
    alt: regret.text,
  };

  return {
    // absolute: the root template would otherwise append "| Jeregrette" twice over
    title: { absolute: title },
    description,
    openGraph: { title, description, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function RegretPage({ params }: PageProps<"/regret/[id]">) {
  const { id } = await params;
  const [item, viewer] = await Promise.all([
    loadItem(id),
    getCurrentUser().catch(() => null),
  ]);
  if (!item) notFound();

  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="w-[599px] max-w-full">
        {item.kind === "repost" ? (
          <RepostCard repost={item.repost} currentUserId={viewer?.id} />
        ) : (
          <RegretCard regret={item.regret} currentUserId={viewer?.id} />
        )}
      </div>

      <Link
        href="/"
        className="flex h-[37px] items-center rounded-[10px] bg-white px-4 text-[14px] font-bold text-black transition-opacity hover:opacity-90"
      >
        Voir tous les regrets
      </Link>
    </main>
  );
}
