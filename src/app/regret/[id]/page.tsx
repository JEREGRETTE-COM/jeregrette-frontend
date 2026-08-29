import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RegretSurface } from "@/components/feed/regret-surface";
import { siteConfig } from "@/lib/config";
import { getRegret } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/regret/[id]">): Promise<Metadata> {
  const { id } = await params;
  const regret = getRegret(id);
  if (!regret) return { title: "Regret introuvable" };

  const title = `${regret.author.handle} sur ${siteConfig.name}`;
  const image = {
    url: `/regret/${id}/image`,
    width: 1080,
    height: 1080,
    alt: regret.text,
  };

  return {
    // absolute: the root template would otherwise append "| Jeregrette" twice over
    title: { absolute: title },
    description: regret.text,
    openGraph: { title, description: regret.text, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title, description: regret.text, images: [image] },
  };
}

export default async function RegretPage({ params }: PageProps<"/regret/[id]">) {
  const { id } = await params;
  const regret = getRegret(id);
  if (!regret) notFound();

  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <RegretSurface
        regret={regret}
        className="h-[400px] w-[599px] max-w-full rounded-[25px]"
      />
      <Link
        href="/"
        className="flex h-[37px] items-center rounded-[10px] bg-white px-4 text-[14px] font-bold text-black transition-opacity hover:opacity-90"
      >
        Voir tous les regrets
      </Link>
    </main>
  );
}
