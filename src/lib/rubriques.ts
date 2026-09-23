import { api } from "@/lib/api";
import type { ApiItem, ApiRubrique } from "@/types/api";

/**
 * Sections a regret can belong to. Both routes need a token — a signed out
 * visitor gets 401 — so the public feed cannot offer them.
 */
export function listRubriques(token: string) {
  return api<{ data: ApiRubrique[] }>("/rubriques", { token });
}

export async function getRubrique(id: string, token: string) {
  const { data } = await api<ApiItem<ApiRubrique>>(`/rubriques/${id}`, { token });
  return data;
}
