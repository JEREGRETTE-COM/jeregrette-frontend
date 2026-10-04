"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";

import { Dialog } from "@/components/ui/dialog";

/**
 * The 75px circle of the profile header. Tapping it opens the photo full size,
 * which is the only way to actually look at someone's picture.
 */
export function AvatarZoom({ src, handle }: { src: string; handle: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Voir la photo de ${handle} en grand`}
        className="mx-auto block size-[75px] rounded-full transition-opacity hover:opacity-90"
      >
        <Image
          src={src}
          alt=""
          width={75}
          height={75}
          unoptimized
          className="h-[75px] w-[75px] rounded-full object-cover"
        />
      </button>

      {/* into <body>: the profile header is sticky, so a nested overlay would sit under it */}
      {open
        ? createPortal(
            <Dialog label={`Photo de ${handle}`} onClose={() => setOpen(false)}>
              <Image
                src={src}
                alt={`Photo de profil de ${handle}`}
                width={1080}
                height={1080}
                unoptimized
                className="max-h-[80dvh] w-auto max-w-[90vw] rounded-[25px] object-contain"
              />
            </Dialog>,
            document.body,
          )
        : null}
    </>
  );
}
