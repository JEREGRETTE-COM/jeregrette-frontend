import type { Metadata } from "next";

import { RegretComposer } from "@/components/compose/regret-composer";
import { requireAuthor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Publier mon regret",
};

export default async function ComposePage() {
  await requireAuthor("/publier");

  return <RegretComposer />;
}
