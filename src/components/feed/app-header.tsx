import Image from "next/image";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { getSession } from "@/lib/session";

/** Figma 85:1050 — 110px blurred bar over the feed. */
export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 h-[110px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
      <div className="relative mx-auto h-full w-full max-w-[853px]">
        <Link href="/" className="absolute left-[18px] top-[53px] flex items-center gap-[10px]">
          <Image
            src="/brand/logo-header.svg"
            alt="Je regrette"
            width={46}
            height={38}
            unoptimized
            className="h-[38px] w-[46px]"
          />
          <span className="text-[20px] font-bold leading-none text-white">Je regrette</span>
        </Link>

        {session ? (
          <div className="absolute right-[17px] top-[54px] flex h-[37px] items-center gap-[12px]">
            <span className="text-[14px] font-medium text-white">{session.handle}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-[37px] rounded-[10px] border-[0.5px] border-[#c5c5c5] px-[12px] text-[14px] font-medium text-white transition-colors hover:bg-white/5"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/inscription"
            className="absolute right-[17px] top-[54px] flex h-[37px] w-[142px] items-center justify-center rounded-[10px] bg-white text-[14px] font-bold text-black transition-opacity hover:opacity-90"
          >
            Créer un compte
          </Link>
        )}
      </div>
    </header>
  );
}
