import Image from "next/image";
import Link from "next/link";

/** Figma 85:1045 — floating call to action, scaled down on small screens. */
export function PublishFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[20px] z-20 mx-auto flex w-full max-w-[853px] justify-end px-4 sm:bottom-[64px] sm:px-0 sm:pr-[29px]">
      <Link
        href="/publier"
        className="pointer-events-auto flex h-[58px] items-center rounded-[37.5px] border-[3px] border-black bg-white pr-[18px] transition-transform hover:scale-[1.02] sm:h-[75px] sm:w-[292px] sm:pr-0"
      >
        <Image
          src="/brand/logo-cta.svg"
          alt=""
          width={48}
          height={39}
          unoptimized
          className="ml-[12px] h-[30px] w-[37px] sm:ml-[14px] sm:h-[39px] sm:w-[48px]"
        />
        <span className="ml-[10px] text-[16px] font-bold text-black sm:ml-[13px] sm:text-[20px]">
          Publier mon regret
        </span>
      </Link>
    </div>
  );
}
