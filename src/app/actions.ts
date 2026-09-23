"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import {
  clearSession,
  getAccessToken,
  ensureSession,
  getCurrentUser,
  getRefreshToken,
  safeNext,
  saveSession,
} from "@/lib/auth";
import {
  createPost,
  deletePost,
  getReactionBreakdown,
  MAX_CONTENT,
  removeReaction,
  repost,
  setReaction,
  updatePostSettings,
  type PostSettings,
} from "@/lib/posts";
import { loadMoreFeed } from "@/lib/feed";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications";
import { reactions } from "@/lib/reactions";
import {
  AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  MAX_BIO,
  updateMe,
  uploadAvatar,
  type ProfileUpdate,
} from "@/lib/users";
import { isHttpsUrl } from "@/lib/utils";
import type { AuthResponse, PostCursor, ReactionType } from "@/types/api";

export type FormState = { error?: string };

const MIN_PASSWORD = 8;
/** Backend limit on register. */
const MAX_EMAIL = 255;
/** Mirrors the backend rule: 3-30 characters, letters, digits and underscore. */
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

export async function signUpAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("password_confirmation") ?? "");

  if (!USERNAME_PATTERN.test(username)) {
    return {
      error:
        "Nom d’utilisateur : 3 à 30 caractères, lettres, chiffres et underscore uniquement.",
    };
  }
  // optional on this backend, so only checked when given
  if (email && !email.includes("@")) return { error: "Adresse email invalide." };
  if (email.length > MAX_EMAIL) {
    return { error: `Adresse email : ${MAX_EMAIL} caractères maximum.` };
  }
  if (password.length < MIN_PASSWORD) {
    return { error: `Mot de passe : ${MIN_PASSWORD} caractères minimum.` };
  }
  if (password !== passwordConfirmation) {
    return { error: "Les deux mots de passe ne correspondent pas." };
  }

  let auth: AuthResponse;
  try {
    auth = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: {
        username,
        ...(email ? { email } : {}),
        password,
        password_confirmation: passwordConfirmation,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return { error: error.displayMessage };
    throw error;
  }

  // register returns tokens like login does; this only guards a malformed reply.
  if (!auth.tokens?.access_token) redirect("/connexion");

  await saveSession(auth.tokens);
  revalidatePath("/", "layout");
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signInAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // An "@" is the only thing that tells the two apart: usernames cannot
  // contain one, the backend rejects the character at registration.
  const looksLikeEmail = identifier.includes("@");

  let auth: AuthResponse;
  try {
    auth = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: looksLikeEmail
        ? { email: identifier, password }
        : { username: identifier, password },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      // The backend answers 401 "Invalid credentials." in English.
      if (error.status === 401) {
        return { error: "Identifiant ou mot de passe incorrect." };
      }
      return { error: error.displayMessage };
    }
    throw error;
  }

  await saveSession(auth.tokens);
  revalidatePath("/", "layout");
  redirect(safeNext(String(formData.get("next") ?? "")));
}

export async function signOutAction() {
  const [token, refreshToken] = await Promise.all([getAccessToken(), getRefreshToken()]);
  if (token) {
    // Revoke the refresh token too, or it would keep minting sessions after
    // logout. A failed revocation must not trap the user in a signed-in shell.
    await api("/auth/logout", {
      method: "POST",
      token,
      body: refreshToken ? { refresh_token: refreshToken } : undefined,
    }).catch(() => {});
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function publishRegretAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await ensureSession().catch(() => null);
  if (!token) {
    return { error: "Impossible d’ouvrir une session invitée. Crée un compte pour publier." };
  }

  const text = String(formData.get("regret") ?? "").trim();
  if (!text) return { error: "Écris ton regret avant de publier." };
  if (text.length > MAX_CONTENT) {
    return { error: `Ton regret dépasse ${MAX_CONTENT} caractères.` };
  }

  // The toggle of Figma 20:372; the post carries the choice from the start.
  const allowRepost = formData.get("allow_repost") !== "0";

  try {
    // The chosen colour is dropped: the post payload has no field for it yet.
    await createPost({ content: text, allow_repost: allowRepost }, token);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.displayMessage };
    throw error;
  }

  revalidatePath("/");
  redirect("/");
}

export async function publishRepostAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await ensureSession().catch(() => null);
  if (!token) {
    return { error: "Impossible d’ouvrir une session invitée. Crée un compte pour republier." };
  }

  const postId = String(formData.get("regretId") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (!postId) return { error: "Regret introuvable." };
  if (comment.length > MAX_CONTENT) {
    return { error: `Ton commentaire dépasse ${MAX_CONTENT} caractères.` };
  }

  try {
    await repost(postId, comment, token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isUnauthenticated) redirect("/connexion");
      if (error.status === 403) return { error: "L’auteur n’autorise pas cette republication." };
      if (error.status === 404) return { error: "Ce regret n’existe plus." };
      return { error: error.displayMessage };
    }
    throw error;
  }

  // The repost lands on the feed, the reposter's profile and the counters.
  revalidatePath("/", "layout");
  redirect("/");
}

const REACTION_IDS = new Set<string>(reactions.map((reaction) => reaction.id));

/** One API call per post, so a batch stays small on purpose. */
const MAX_COUNT_IDS = 6;

/**
 * Counts for cards the reader scrolled to. The feed preloads only its first
 * cards: one call per post would otherwise blow the API's 30-a-minute limit.
 */
export async function loadReactionCountsAction(ids: string[]) {
  const token = await getAccessToken();
  if (!token) return {};

  const wanted = ids.filter((id) => typeof id === "string" && id).slice(0, MAX_COUNT_IDS);
  const entries = await Promise.all(
    wanted.map(async (id) => {
      try {
        const { breakdown } = await getReactionBreakdown(id, token);
        return [id, breakdown] as const;
      } catch {
        // A refused count leaves the chips without numbers, nothing worse.
        return null;
      }
    }),
  );

  return Object.fromEntries(entries.filter((entry) => entry !== null));
}

export async function toggleReactionAction(formData: FormData) {
  // A visitor reacting for the first time becomes a guest, rather than being
  // bounced to a sign-up form. Guest accounts are rate limited, so signing up
  // stays the fallback when the API refuses to mint one.
  const token = await ensureSession().catch(() => null);
  if (!token) redirect("/inscription");

  const postId = String(formData.get("itemId") ?? "");
  const reaction = String(formData.get("reaction") ?? "");
  const current = String(formData.get("current") ?? "");
  // Form data is user-controlled: only the documented types reach the API.
  if (!postId || !REACTION_IDS.has(reaction)) return;

  try {
    // Tapping the active reaction clears it, exactly like the optimistic update.
    if (current === reaction) await removeReaction(postId, token);
    else await setReaction(postId, reaction as ReactionType, token);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.isUnauthenticated) redirect("/connexion");
    // Timeout, deleted post, refused vote: the optimistic chip falls back to the
    // server state once the action settles, so a failure must not crash the page.
    return;
  }

  // Reaction bars also live on /profil, /u/[id] and /regret/[id]; a bare "/"
  // would only refresh the home page and leave those showing the old vote.
  revalidatePath("/", "layout");
}

export async function loadMoreFeedAction(cursor: PostCursor | null, seenIds: string[]) {
  const page = await loadMoreFeed(cursor, seenIds);
  return page ?? { items: [], cursor: null, hasMore: false };
}

export async function updatePostSettingsAction(postId: string, settings: PostSettings) {
  const token = await getAccessToken();
  if (!token) return { error: "Session expirée." };

  try {
    await updatePostSettings(postId, settings, token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) return { error: "Tu ne peux modifier que tes propres regrets." };
      return { error: error.displayMessage };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/profil");
  return {};
}

export async function deletePostAction(postId: string) {
  const token = await getAccessToken();
  if (!token) return { error: "Session expirée." };

  try {
    await deletePost(postId, token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) return { error: "Tu ne peux supprimer que tes propres regrets." };
      return { error: error.displayMessage };
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/profil");
  return {};
}

/**
 * Sends the picked photo to the backend, which stores it and hands back its
 * URL. The browser has already cropped and shrunk it.
 */
export async function uploadAvatarAction(
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) return { error: "Session expirée, reconnecte-toi." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Choisis une image." };
  if (!AVATAR_TYPES.includes(file.type)) {
    return { error: "Formats acceptés : JPG, PNG ou WebP." };
  }
  if (file.size > MAX_AVATAR_BYTES) return { error: "Image trop lourde : 5 Mo maximum." };

  try {
    const user = await uploadAvatar(file, token);
    revalidatePath("/", "layout");
    return { url: user.avatar_url ?? undefined };
  } catch (error) {
    if (error instanceof ApiError) {
      // The route is agreed but not deployed yet.
      if (error.status === 404 || error.status === 405) {
        return { error: "L’envoi de photo n’est pas encore prêt côté serveur." };
      }
      if (error.isUnauthenticated) return { error: "Session expirée, reconnecte-toi." };
      return { error: error.displayMessage };
    }
    throw error;
  }
}

export async function updateProfileAction(formData: FormData): Promise<FormState> {
  const [token, me] = await Promise.all([getAccessToken(), getCurrentUser()]);
  if (!token || !me) return { error: "Session expirée, reconnecte-toi." };

  const username = String(formData.get("username") ?? "").trim().replace(/^@/, "");
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  if (!USERNAME_PATTERN.test(username)) {
    return { error: "Nom d’utilisateur : 3 à 30 caractères, lettres, chiffres ou _." };
  }
  if (bio.length > MAX_BIO) return { error: `Ta bio dépasse ${MAX_BIO} caractères.` };
  // Other viewers' browsers and the share-image route load this link.
  if (avatarUrl && !isHttpsUrl(avatarUrl)) {
    return { error: "Le lien de la photo doit commencer par https://" };
  }

  // Only what changed goes out: resending your own username could trip the
  // uniqueness rule. Empty fields clear the value rather than storing "".
  const update: ProfileUpdate = {};
  if (username !== me.username) update.username = username;
  if ((bio || null) !== (me.bio || null)) update.bio = bio || null;
  if ((avatarUrl || null) !== (me.avatar_url || null)) update.avatar_url = avatarUrl || null;
  if (Object.keys(update).length === 0) return {};

  try {
    await updateMe(update, token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isUnauthenticated) return { error: "Session expirée, reconnecte-toi." };
      if (error.errors?.username) return { error: "Ce nom d’utilisateur est déjà pris." };
      if (error.errors?.avatar_url) return { error: "Le lien de la photo n’est pas valide." };
      return { error: error.displayMessage };
    }
    throw error;
  }

  // The handle and avatar also appear in the header menu and on every card.
  revalidatePath("/", "layout");
  return {};
}

export async function markNotificationReadAction(id: string): Promise<FormState> {
  const token = await getAccessToken();
  if (!token) return { error: "Session expirée, reconnecte-toi." };

  try {
    await markNotificationRead(id, token);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.displayMessage };
    throw error;
  }
  // the header badge and the list both show the unread count
  revalidatePath("/", "layout");
  return {};
}

export async function markAllNotificationsReadAction(): Promise<FormState> {
  const token = await getAccessToken();
  if (!token) return { error: "Session expirée, reconnecte-toi." };

  try {
    await markAllNotificationsRead(token);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.displayMessage };
    throw error;
  }
  // the header badge and the list both show the unread count
  revalidatePath("/", "layout");
  return {};
}
