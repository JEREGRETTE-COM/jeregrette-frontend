"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cropToAvatar } from "@/lib/image";

/** The square frame shown on screen; the output is always 512px. */
const VIEWPORT = 260;
const MAX_ZOOM = 3;

/**
 * Lets the writer choose which square of their photo becomes the avatar: drag
 * to move, slide to zoom. Replaces the blind centre crop.
 */
export function PhotoCropper({
  file,
  onCancel,
  onDone,
}: {
  file: File;
  onCancel: () => void;
  onDone: (cropped: File) => void;
}) {
  const [source, setSource] = useState<ImageBitmap | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Decoding is async, so it cannot happen while React renders.
  useEffect(() => {
    let live = true;
    const objectUrl = URL.createObjectURL(file);
    createImageBitmap(file)
      .then((bitmap) => {
        if (!live) return;
        setSource(bitmap);
        setUrl(objectUrl);
      })
      .catch(() => undefined);

    return () => {
      live = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!source || !url) {
    return (
      <div className="bg-field-alt size-[260px] animate-pulse rounded-[20px]" aria-hidden />
    );
  }

  // Captured after the guard: the closures below keep the decoded image.
  const bitmap = source;

  // The photo always covers the frame: its shorter side fills it, times the zoom.
  const base = VIEWPORT / Math.min(bitmap.width, bitmap.height);
  const scale = base * zoom;
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;

  const clamp = (next: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(VIEWPORT - width, next.x)),
    y: Math.min(0, Math.max(VIEWPORT - height, next.y)),
  });

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setOffset(clamp({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y }));
  }

  function changeZoom(next: number) {
    // keep the centre of the frame where it was, so zooming does not jump
    const previous = base * zoom;
    const factor = (base * next) / previous;
    setZoom(next);
    setOffset((current) =>
      clamp({
        x: VIEWPORT / 2 - (VIEWPORT / 2 - current.x) * factor,
        y: VIEWPORT / 2 - (VIEWPORT / 2 - current.y) * factor,
      }),
    );
  }

  async function validate() {
    setBusy(true);
    try {
      onDone(
        await cropToAvatar(bitmap, {
          x: -offset.x / scale,
          y: -offset.y / scale,
          size: VIEWPORT / scale,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        className="relative size-[260px] cursor-grab touch-none overflow-hidden rounded-full active:cursor-grabbing"
      >
        <Image
          src={url}
          alt=""
          width={Math.round(width)}
          height={Math.round(height)}
          unoptimized
          draggable={false}
          style={{ position: "absolute", left: offset.x, top: offset.y, width, height, maxWidth: "none" }}
        />
      </div>

      <label className="mt-[16px] flex w-full max-w-[260px] items-center gap-[10px]">
        <span className="text-label text-[12px]">Zoom</span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(event) => changeZoom(Number(event.target.value))}
          className="h-[4px] flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
        />
      </label>

      <p className="text-label mt-[10px] text-center text-[12px]">
        Fais glisser la photo pour choisir ce qui reste visible.
      </p>

      <div className="mt-[16px] flex w-full gap-[10px]">
        <button
          type="button"
          onClick={onCancel}
          className="h-[46px] flex-1 rounded-[23px] border-[0.5px] border-[#c5c5c5] text-[15px] font-medium text-white transition-colors hover:bg-white/5"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={validate}
          disabled={busy}
          className="h-[46px] flex-1 rounded-[23px] bg-white text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "…" : "Recadrer"}
        </button>
      </div>
    </div>
  );
}
