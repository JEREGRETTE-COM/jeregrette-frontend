import { cookies } from "next/headers";

import type { Author } from "@/types";

const COOKIE = "jr_session";

/** Avatars shipped with the design, reused as stand-ins until uploads exist. */
const avatars = [
  "/avatars/adjamela3.png",
  "/avatars/grandpapa.png",
  "/avatars/aquilafaute.png",
  "/avatars/fucklesmogodeb.png",
  "/avatars/terrifiedofwoman457.png",
];

function avatarFor(handle: string) {
  const sum = [...handle].reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatars[sum % avatars.length];
}

/** "armand.yapi@x.com" -> "@armandyapi" */
export function handleFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const slug = local.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `@${slug || "regretteur"}`;
}

export async function getSession(): Promise<Author | null> {
  const handle = (await cookies()).get(COOKIE)?.value;
  if (!handle) return null;
  return { handle, avatar: avatarFor(handle) };
}

export async function startSession(handle: string) {
  (await cookies()).set(COOKIE, handle, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
