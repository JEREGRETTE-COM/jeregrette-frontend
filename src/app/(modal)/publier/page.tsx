import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { RegretComposer } from "@/components/compose/regret-composer";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Publier mon regret",
};

export default async function ComposePage() {
  if (!(await getSession())) redirect("/inscription");

  return <RegretComposer />;
}
