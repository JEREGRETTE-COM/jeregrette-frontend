import Link from "next/link";

import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import { loadFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

/** The API answers 401 on /posts, so there is nothing to show signed out. */
function SignedOut() {
  return (
    <div className="mx-auto flex w-[599px] max-w-full flex-col items-center gap-6 px-4 py-24 text-center">
      <p className="text-[20px] font-semibold text-white">
        Connecte-toi pour voir les regrets
      </p>
      <p className="text-muted max-w-[420px] text-[15px]">
        Le fil est réservé aux regretteurs. Crée un compte, ça prend dix secondes.
      </p>
      <Link
        href="/inscription"
        className="flex h-[50px] items-center rounded-[25px] bg-white px-8 text-[15px] font-semibold text-black transition-opacity hover:opacity-90"
      >
        Créer un compte
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const feed = await loadFeed();

  if (!feed) return <SignedOut />;

  if (feed.length === 0) {
    return (
      <div className="mx-auto w-[599px] max-w-full px-4 py-24 text-center">
        <p className="text-muted text-[15px]">
          Aucun regret pour le moment. Sois le premier.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-[599px] max-w-full flex-col gap-[10px] pb-[180px] pt-[10px]">
      {feed.map((item) =>
        item.kind === "regret" ? (
          <RegretCard key={item.regret.id} regret={item.regret} />
        ) : (
          <RepostCard key={item.repost.id} repost={item.repost} />
        ),
      )}
    </div>
  );
}
