import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import { getAccessToken, getCurrentUser, toAuthor } from "@/lib/auth";
import { toFeedItems } from "@/lib/feed";
import { initial } from "@/lib/utils";
import { listMyPosts } from "@/lib/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  // Independent calls, so they share one round trip instead of two.
  const [user, myPosts] = await Promise.all([
    getCurrentUser(),
    listMyPosts(token).catch(() => ({ posts: [], nextCursor: null, hasMore: false })),
  ]);
  if (!user) redirect("/inscription");

  const author = toAuthor(user);
  const items = await toFeedItems(myPosts.posts, token);

  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
      {/* Figma 165:1804 — 70px blurred bar with a back arrow and the title. */}
      <header className="sticky top-0 z-30 h-[70px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
        <div className="mx-auto flex h-full w-full max-w-[599px] items-center gap-[16px] px-[25px]">
          <Link
            href="/"
            aria-label="Retour"
            className="size-[35px] shrink-0 transition-opacity hover:opacity-80"
          >
            <Image src="/icons/back.svg" alt="" width={35} height={35} unoptimized />
          </Link>
          <p className="text-[16px] text-white">Profil</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[599px] flex-col px-[25px] pb-[140px]">
        <div className="relative mx-auto mt-[9px] size-[75px]">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt=""
              width={75}
              height={75}
              className="h-[75px] w-[75px] rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-[75px] w-[75px] items-center justify-center rounded-full bg-white/20 text-[30px] font-semibold text-white"
            >
              {initial(author.handle)}
            </span>
          )}

          {/* No avatar upload endpoint yet, so the badge is decoration. */}
          <span
            aria-hidden
            className="absolute -right-[2px] bottom-0 flex size-[28px] items-center justify-center"
          >
            <Image
              src="/icons/edit-badge.svg"
              alt=""
              width={28}
              height={28}
              unoptimized
              className="absolute inset-0 h-[28px] w-[28px]"
            />
            <Image
              src="/icons/pencil.svg"
              alt=""
              width={14}
              height={14}
              unoptimized
              className="relative h-[14px] w-[14px]"
            />
          </span>
        </div>

        <p className="mt-[7px] break-all text-center text-[16px] font-semibold text-white">
          {author.handle}
        </p>

        <Link
          href="/publier"
          className="mx-auto mt-[16px] flex h-[42px] items-center gap-[8px] rounded-[37.5px] bg-white px-[16px] transition-opacity hover:opacity-90"
        >
          <Image
            src="/brand/logo-inline.svg"
            alt=""
            width={25}
            height={20}
            unoptimized
            className="h-[20px] w-[25px]"
          />
          <span className="text-[14px] font-semibold text-black">Publier un regret</span>
        </Link>

        <p className="text-label mt-[23px] text-[14px]">Mes anciens regrets</p>

        {items.length === 0 ? (
          <p className="text-muted mt-[24px] text-[15px]">
            Tu n’as encore rien publié.
          </p>
        ) : (
          <div className="mt-[12px] flex flex-col gap-[10px]">
            {items.map((item) =>
              item.kind === "regret" ? (
                <RegretCard key={item.regret.id} regret={item.regret} />
              ) : (
                <RepostCard key={item.repost.id} repost={item.repost} />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}
