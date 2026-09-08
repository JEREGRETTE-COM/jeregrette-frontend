import Image from "next/image";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { getCurrentAuthor } from "@/lib/auth";

/**
 * Figma 85:1050 — blurred bar over the feed. The design pins its content to the
 * bottom of a 110px bar; below sm the bar shrinks and simply centres it.
 */
export async function AppHeader() {
  const author = await getCurrentAuthor();

  return (
    <header className="sticky top-0 z-30 w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
      <div className="mx-auto flex h-[68px] w-full max-w-[853px] items-center justify-between gap-3 px-4 sm:h-[110px] sm:items-end sm:px-[18px] sm:pb-[19px]">
        <Link href="/" className="flex min-w-0 items-center gap-[10px]">
          <Image
            src="/brand/logo-header.svg"
            alt="Je regrette"
            width={46}
            height={38}
            unoptimized
            className="h-[30px] w-[36px] shrink-0 sm:h-[38px] sm:w-[46px]"
          />
          <span className="truncate text-[17px] font-bold leading-none text-white sm:text-[20px]">
            Je regrette
          </span>
        </Link>

        {author ? (
          <div className="flex min-w-0 items-center gap-[10px]">
            <span className="hidden truncate text-[14px] font-medium text-white sm:inline">
              {author.handle}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-[37px] shrink-0 rounded-[10px] border-[0.5px] border-[#c5c5c5] px-[12px] text-[13px] font-medium text-white transition-colors hover:bg-white/5 sm:text-[14px]"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/inscription"
            className="flex h-[37px] shrink-0 items-center justify-center rounded-[10px] bg-white px-[14px] text-[13px] font-bold text-black transition-opacity hover:opacity-90 sm:w-[142px] sm:px-0 sm:text-[14px]"
          >
            Créer un compte
          </Link>
        )}
      </div>
    </header>
  );
}
