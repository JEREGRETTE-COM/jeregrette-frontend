"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { clearSession, getAccessToken, saveSession } from "@/lib/auth";
import {
  createPost,
  MAX_CONTENT,
  removeReaction,
  repost,
  setReaction,
} from "@/lib/posts";
import type { AuthResponse, ReactionType } from "@/types/api";

export type FormState = { error?: string };

const MIN_PASSWORD = 8;
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
  if (!email.includes("@")) return { error: "Adresse email invalide." };
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
        email,
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
  redirect("/");
}

export async function signInAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let auth: AuthResponse;
  try {
    auth = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      // The backend answers 401 "Invalid credentials." in English.
      if (error.status === 401) return { error: "Email ou mot de passe incorrect." };
      return { error: error.displayMessage };
    }
    throw error;
  }

  await saveSession(auth.tokens);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  const token = await getAccessToken();
  if (token) {
    // A failed revocation must not trap the user in a signed-in shell.
    await api("/auth/logout", { method: "POST", token }).catch(() => {});
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function publishRegretAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  const text = String(formData.get("regret") ?? "").trim();
  if (!text) return { error: "Écris ton regret avant de publier." };
  if (text.length > MAX_CONTENT) {
    return { error: `Ton regret dépasse ${MAX_CONTENT} caractères.` };
  }

  try {
    // The chosen colour is dropped: the post payload has no field for it yet.
    await createPost({ content: text }, token);
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
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  const postId = String(formData.get("regretId") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  if (comment.length > MAX_CONTENT) {
    return { error: `Ton commentaire dépasse ${MAX_CONTENT} caractères.` };
  }

  try {
    await repost(postId, comment, token);
  } catch (error) {
    if (error instanceof ApiError) return { error: error.displayMessage };
    throw error;
  }

  revalidatePath("/");
  redirect("/");
}

export async function toggleReactionAction(formData: FormData) {
  const token = await getAccessToken();
  if (!token) redirect("/inscription");

  const postId = String(formData.get("itemId") ?? "");
  const reaction = String(formData.get("reaction") ?? "") as ReactionType;
  const current = String(formData.get("current") ?? "");

  // Tapping the active reaction clears it, exactly like the optimistic update.
  if (current === reaction) await removeReaction(postId, token);
  else await setReaction(postId, reaction, token);

  revalidatePath("/");
}
