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

  // TEMP diagnostic (dev only): does the new regret exist on the server?
  if (process.env.NODE_ENV !== "production") {
    console.info("[diag profil] GET /users/me/posts", {
      count: myPosts.posts.length,
      hasMore: myPosts.hasMore,
      posts_count: user.posts_count,
      latest: myPosts.posts.slice(0, 3).map((post) => ({ id: post.id, created_at: post.created_at })),
    });
  }

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
