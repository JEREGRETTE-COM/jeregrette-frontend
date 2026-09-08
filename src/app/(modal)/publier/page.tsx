import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegretComposer } from "@/components/compose/regret-composer";
import { getCurrentAuthor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Publier mon regret",
};

export default async function ComposePage() {
  if (!(await getCurrentAuthor())) redirect("/inscription");

  return <RegretComposer />;
}
