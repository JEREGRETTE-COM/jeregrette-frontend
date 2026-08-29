"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { endSession, getSession, handleFromEmail, startSession } from "@/lib/session";
import { authenticate, createAccount, findAccount } from "@/lib/users";
import { addRegret, addRepost, toggleReaction } from "@/lib/store";
import type { ReactionId } from "@/types";

export type FormState = { error?: string };

const MIN_PASSWORD = 8;

export async function signUpAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email.includes("@")) return { error: "Adresse email invalide." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Mot de passe : ${MIN_PASSWORD} caractères minimum.` };
  }
  if (findAccount(email)) {
    return { error: "Un compte existe déjà avec cette adresse." };
  }

  const account = createAccount(email, handleFromEmail(email), password);
  await startSession(account.handle);
  redirect("/");
}

export async function signInAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const account = authenticate(email, password);
  if (!account) return { error: "Email ou mot de passe incorrect." };

  await startSession(account.handle);
  redirect("/");
}

export async function signOutAction() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function publishRegretAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const author = await getSession();
  if (!author) redirect("/inscription");

  const text = String(formData.get("regret") ?? "").trim();
  if (!text) return { error: "Écris ton regret avant de publier." };

  addRegret({
    author,
    text,
    background: String(formData.get("background") ?? "#4b8710"),
  });
  revalidatePath("/");
  redirect("/");
}

export async function publishRepostAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const author = await getSession();
  if (!author) redirect("/inscription");

  const regretId = String(formData.get("regretId") ?? "");
  const created = addRepost({
    regretId,
    comment: String(formData.get("comment") ?? "").trim(),
    author,
  });
  if (!created) return { error: "Ce regret n’existe plus." };

  revalidatePath("/");
  redirect("/");
}

export async function toggleReactionAction(formData: FormData) {
  toggleReaction(
    String(formData.get("itemId") ?? ""),
    String(formData.get("reaction")) as ReactionId,
  );
  revalidatePath("/");
}
