import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileView } from "@/components/profile/profile-view";
import { ApiError } from "@/lib/api";
import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { toFeedItems } from "@/lib/feed";
import { listMyPosts } from "@/lib/users";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profil" };

/** Figma 167:980 — the signed-in user's own profile. */
export default async function ProfilePage() {
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  const [user, myPosts] = await Promise.all([
    getCurrentUser(),
    // A failure must not pass for an empty profile: it goes on to error.tsx.
    listMyPosts(token).catch((error) => {
      if (error instanceof ApiError && error.isUnauthenticated) redirect("/connexion");
      throw error;
    }),
  ]);
  if (!user) redirect("/inscription");
  // Nothing to show an anonymous account: it has no name, no bio, no settings.
  if (user.is_guest) redirect("/inscription");

  const items = await toFeedItems(myPosts.posts, token);
  return (
    <ProfileView
      user={user}
      items={items}
      viewerId={user.id}
      own
      loaded={{ count: myPosts.posts.length, hasMore: myPosts.hasMore }}
    />
  );
}
