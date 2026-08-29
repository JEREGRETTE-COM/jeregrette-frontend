import Image from "next/image";
import Link from "next/link";

/**
 * Shell of the auth modal — Figma node 140:1241 (520x705).
 * Close button, logo and two-line title are shared by every auth screen.
 */
export function AuthCard({
  title,
  highlight,
  children,
}: {
  title: string;
  highlight: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-surface-border bg-surface relative flex h-[705px] w-[520px] max-w-full flex-col overflow-hidden rounded-[25px] border-y-[3px] px-6">
      <Link
        href="/"
        aria-label="Fermer"
        className="absolute left-[15px] top-[11px] size-[35px] transition-opacity hover:opacity-80"
      >
        <Image src="/icons/close.svg" alt="" width={35} height={35} unoptimized />
      </Link>

      <Image
        src="/brand/logo.svg"
        alt="Jeregrette"
        width={60}
        height={50}
        unoptimized
        className="mt-[81px] h-[50px] w-[60px] self-center"
      />

      <h1 className="mt-[10px] text-center text-[24px] font-medium leading-[30px] text-white">
        {title}
        <br />
        <span className="font-black">{highlight}</span>
      </h1>

      {children}
    </div>
  );
}
