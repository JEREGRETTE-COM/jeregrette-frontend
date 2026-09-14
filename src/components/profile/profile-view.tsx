import Image from "next/image";
import Link from "next/link";

import { RegretCard } from "@/components/feed/regret-card";
import { EditProfileButton } from "@/components/profile/edit-profile-button";
import { RepostCard } from "@/components/feed/repost-card";
import { initial, safeAvatar } from "@/lib/utils";
import type { ApiAuthUser } from "@/types/api";
import type { FeedItem } from "@/types";

/**
 * Figma 167:980 (your own profile) and 223:1072 (someone else's) share this
 * layout. Followers, following, sorting, the verified badge and the follow
 * button are left out: the API exposes none of them yet.
 */
export function ProfileView({
  user,
  items,
  viewerId,
  own,
}: {
  user: ApiAuthUser;
  items: FeedItem[];
  viewerId: string;
  own: boolean;
}) {
  const handle = `@${user.username}`;
  const profile = {
    username: user.username,
    bio: user.bio ?? "",
    avatarUrl: user.avatar_url ?? "",
  };
  const avatar = safeAvatar(user.avatar_url);

  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
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
          {/* Figma 167:994 — the pencil only exists on your own profile */}
          {own ? <EditProfileButton profile={profile} /> : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[599px] flex-col px-[25px] pb-[140px]">
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={75}
            height={75}
            unoptimized
            className="mx-auto h-[75px] w-[75px] rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="mx-auto flex h-[75px] w-[75px] items-center justify-center rounded-full bg-white/20 text-[30px] font-semibold text-white"
          >
            {initial(handle)}
          </span>
        )}

        <p className="mt-[7px] break-all text-center text-[16px] font-semibold text-white">
          {handle}
        </p>

        {/* posts_count is optional in the spec: no number beats a wrong one */}
        {user.posts_count !== undefined ? (
          <div className="mt-[10px] flex justify-center">
            <div className="flex flex-col items-center leading-[1.2] text-white">
              <span className="text-[16px] font-bold">{user.posts_count}</span>
              <span className="text-[14px]">{user.posts_count > 1 ? "regrets" : "regret"}</span>
            </div>
          </div>
        ) : null}

        {user.bio ? (
          <p className="mx-auto mt-[15px] max-w-[342px] whitespace-pre-line break-words text-center text-[14px] text-white">
            {user.bio}
          </p>
        ) : own ? (
          <div className="mt-[12px] flex justify-center">
            <EditProfileButton profile={profile} variant="text" />
          </div>
        ) : null}

        {/* Figma reuses "Mes anciens regrets" on another user's profile; that reads wrong */}
        <p className="text-label mt-[16px] text-[14px]">
          {own ? "Mes anciens regrets" : "Ses anciens regrets"}
        </p>

        {items.length === 0 ? (
          <p className="text-muted mt-[24px] text-[15px]">
            {own ? "Tu n’as encore rien publié." : "Aucun regret publié pour le moment."}
          </p>
        ) : (
          <div className="mt-[20px] flex flex-col gap-[10px]">
            {items.map((item) =>
              item.kind === "regret" ? (
                <RegretCard key={item.regret.id} regret={item.regret} currentUserId={viewerId} />
              ) : (
                <RepostCard key={item.repost.id} repost={item.repost} currentUserId={viewerId} />
              ),
            )}
          </div>
        )}
      </div>

      <Link
        href="/publier"
        aria-label="Publier un regret"
        className="fixed bottom-[25px] right-[26px] z-20 size-[75px] transition-transform hover:scale-[1.04]"
      >
        <Image
          src="/brand/fab-ring.svg"
          alt=""
          width={108}
          height={108}
          unoptimized
          className="pointer-events-none absolute inset-[-22%] h-[calc(100%+44%)] w-[calc(100%+44%)] max-w-none"
        />
        <Image
          src="/brand/logo-cta.svg"
          alt=""
          width={48}
          height={39}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[39px] w-[48px] -translate-x-1/2 -translate-y-1/2"
        />
      </Link>
    </main>
  );
}
