import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { ApiError } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { toFeedItems } from "@/lib/feed";
import { getUser, listUserPosts } from "@/lib/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profil" };

/**
 * Only a missing user is expected here. A timeout or a server error goes on to
 * error.tsx instead of passing for "no such user" or "no regrets".
 */
function whenMissing<T>(fallback: T) {
  return (error: unknown): T => {
    if (error instanceof ApiError && error.isUnauthenticated) redirect("/connexion");
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) {
      return fallback;
    }
    throw error;
  };
}

/** Figma 223:1072 — another user's profile, opened from a card. */
export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  // three independent reads, one round trip
  const [viewer, user, theirPosts] = await Promise.all([
    getCurrentUser(),
    getUser(id, token).catch(whenMissing(null)),
    listUserPosts(id, token).catch(whenMissing({ posts: [], nextCursor: null, hasMore: false })),
  ]);

  if (!viewer) redirect("/inscription");
  if (viewer.id === id) redirect("/profil");
  if (!user) notFound();

  const items = await toFeedItems(theirPosts.posts, token);
  return (
    <ProfileView
      user={user}
      items={items}
      viewerId={viewer.id}
      own={false}
      loaded={{ count: theirPosts.posts.length, hasMore: theirPosts.hasMore }}
    />
  );
}
