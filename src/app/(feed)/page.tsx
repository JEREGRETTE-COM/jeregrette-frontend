import Link from "next/link";

import { BackToTop } from "@/components/feed/back-to-top";
import { FeedOutage } from "@/components/feed/feed-outage";
import { LoadMore } from "@/components/feed/load-more";
import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import { getCurrentUser } from "@/lib/auth";
import { loadFeed, loadPublicFeed } from "@/lib/feed";
import type { FeedItem } from "@/types";

export const dynamic = "force-dynamic";

function FeedCards({
  items,
  viewerId,
  hideCounts = false,
}: {
  items: FeedItem[];
  viewerId?: string;
  hideCounts?: boolean;
}) {
  return items.map((item) =>
    item.kind === "regret" ? (
      <RegretCard
        key={item.regret.id}
        regret={item.regret}
        currentUserId={viewerId}
        hideCounts={hideCounts}
      />
    ) : (
      <RepostCard
        key={item.repost.id}
        repost={item.repost}
        currentUserId={viewerId}
        hideCounts={hideCounts}
      />
    ),
  );
}

/** Figma 85:863 shows the feed to visitors, with sign-up as the way in. */
function JoinPrompt() {
  return (
    <div className="bg-row flex flex-col items-center gap-[12px] rounded-[25px] px-[20px] py-[22px] text-center">
      <p className="text-[17px] font-semibold text-white">Rejoins les regretteurs</p>
      <p className="text-muted max-w-[380px] text-[14px]">
        Crée un compte pour réagir, republier et voir tout le fil.
      </p>
      <div className="flex flex-wrap justify-center gap-[10px]">
        <Link
          href="/inscription"
          className="flex h-[44px] items-center rounded-[22px] bg-white px-[20px] text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
        >
          Créer un compte
        </Link>
        <Link
          href="/connexion"
          className="flex h-[44px] items-center rounded-[22px] border-[0.5px] border-[#c5c5c5] px-[20px] text-[14px] font-medium text-white transition-colors hover:bg-white/5"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}

const columnClassName =
  "mx-auto flex w-full max-w-[599px] flex-col gap-[10px] px-3 pb-[140px] pt-[10px] sm:px-0 sm:pb-[180px]";

export default async function HomePage() {
  // both read the session cookie; getCurrentUser is cached for this render
  const [state, viewer] = await Promise.all([
    loadFeed(),
    // the outage screen below covers a failing API, so this must not throw
    getCurrentUser().catch(() => null),
  ]);

  if (state.kind === "outage") return <FeedOutage />;

  if (state.kind === "anonymous") {
    const items = await loadPublicFeed();
    return (
      <>
        <div className={columnClassName}>
          <JoinPrompt />
          {items.length === 0 ? (
            <p className="text-muted py-10 text-center text-[15px]">
              Aucun regret à afficher pour le moment.
            </p>
          ) : (
            <>
              <FeedCards items={items} hideCounts />
              <JoinPrompt />
            </>
          )}
        </div>
        <BackToTop />
      </>
    );
  }

  const page = state.page;

  if (page.items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[599px] px-4 py-20 text-center">
        <p className="text-muted text-[15px]">Aucun regret pour le moment. Sois le premier.</p>
      </div>
    );
  }

  return (
    <>
      <div className={columnClassName}>
        <FeedCards items={page.items} viewerId={viewer?.id} />

        <LoadMore
          initialIds={page.items.map((item) =>
            item.kind === "regret" ? item.regret.id : item.repost.id,
          )}
          initialCursor={page.cursor}
          initialHasMore={page.hasMore}
          currentUserId={viewer?.id}
        />
      </div>

      <BackToTop />
    </>
  );
}
