import Image from "next/image";
import Link from "next/link";

/** Figma 85:1045 — floating 292x75 call to action. */
export function PublishFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[64px] z-20 mx-auto flex w-full max-w-[853px] justify-end pr-[29px]">
      <Link
        href="/publier"
        className="pointer-events-auto flex h-[75px] w-[292px] max-w-full items-center rounded-[37.5px] border-[3px] border-black bg-white transition-transform hover:scale-[1.02]"
      >
        <Image
          src="/brand/logo-cta.svg"
          alt=""
          width={48}
          height={39}
          unoptimized
          className="ml-[14px] h-[39px] w-[48px]"
        />
        <span className="ml-[13px] text-[20px] font-bold text-black">Publier mon regret</span>
      </Link>
    </div>
  );
}
