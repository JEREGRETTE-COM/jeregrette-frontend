import Image from "next/image";
import Link from "next/link";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-surface font-poppins flex flex-1 flex-col">
      <header className="sticky top-0 z-30 h-[70px] w-full bg-[rgba(22,22,22,0.75)] backdrop-blur-[25px]">
        <div className="mx-auto flex h-full w-full max-w-[720px] items-center gap-[16px] px-[25px]">
          <Link
            href="/"
            aria-label="Retour"
            className="size-[35px] shrink-0 transition-opacity hover:opacity-80"
          >
            <Image src="/icons/back.svg" alt="" width={35} height={35} unoptimized />
          </Link>
          <p className="text-[16px] text-white">Jeregrette</p>
        </div>
      </header>

      <article className="mx-auto w-full max-w-[720px] px-[25px] pb-24 pt-6 text-[15px] leading-[1.65] text-[#c9c9c9] [&_a]:font-medium [&_a]:text-white [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-9 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-white [&_li]:mt-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </article>
    </main>
  );
}
