import Image from "next/image";

import { Button } from "@/components/ui/button";

const providers = [
  {
    id: "google",
    label: "Continuer avec Google",
    icon: "/icons/google.svg",
    // Figma: 28.165 x 28.165, 18.5px from the button's left edge.
    iconClassName: "h-[28.165px] w-[28.165px]",
  },
  {
    id: "tiktok",
    label: "Continuer avec Tiktok",
    icon: "/icons/tiktok.svg",
    // Figma: 24.84 x 27.945, 18.2px from the button's left edge.
    iconClassName: "h-[27.945px] w-[24.84px]",
  },
] as const;

export function OAuthButtons() {
  return (
    <div className="mt-[10px] flex flex-col gap-[11px]">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant="outline"
          className="border-outline relative h-[50px] w-full rounded-[25px] border-[0.5px] bg-transparent text-[15px] font-medium text-white hover:bg-white/5"
        >
          <Image
            src={provider.icon}
            alt=""
            width={29}
            height={28}
            unoptimized
            className={`absolute left-[18px] top-1/2 -translate-y-1/2 ${provider.iconClassName}`}
          />
          {provider.label}
        </Button>
      ))}
    </div>
  );
}
