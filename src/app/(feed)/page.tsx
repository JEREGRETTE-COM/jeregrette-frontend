import { RegretCard } from "@/components/feed/regret-card";
import { RepostCard } from "@/components/feed/repost-card";
import { getFeed } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const feed = getFeed();

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
