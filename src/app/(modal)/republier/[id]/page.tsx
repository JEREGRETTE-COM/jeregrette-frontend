import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { RepostComposer } from "@/components/repost/repost-composer";
import { getSession } from "@/lib/session";
import { getRegret } from "@/lib/store";

export const metadata: Metadata = {
  title: "Republier",
};

export default async function RepostPage({ params }: PageProps<"/republier/[id]">) {
  const author = await getSession();
  if (!author) redirect("/inscription");

  const { id } = await params;
  const regret = getRegret(id);
  if (!regret) notFound();

  return <RepostComposer regret={regret} author={author} />;
}
