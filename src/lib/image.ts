/** Square side for avatars: enough for a 75px circle on a retina screen. */
export const AVATAR_SIZE = 512;
const QUALITY = 0.85;

/**
 * Centre-crops a picked photo to a square and shrinks it, so a 4 MB shot from a
 * phone leaves as roughly 100 KB. Browser only: it draws on a canvas.
 */
export async function toSquareAvatar(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas indisponible");
  }

  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

  // Safari only gained webp encoding recently, hence the jpeg fallback.
  const blob = (await encode("image/webp")) ?? (await encode("image/jpeg"));
  if (!blob) throw new Error("Conversion impossible");

  const type = blob.type || "image/jpeg";
  return new File([blob], `avatar.${type === "image/webp" ? "webp" : "jpg"}`, { type });
}

/** The square the reader framed, in the source image's own pixels. */
export type Crop = { x: number; y: number; size: number };

/**
 * Renders the chosen square at AVATAR_SIZE. Same output as toSquareAvatar, but
 * the frame comes from the reader instead of the centre of the photo.
 */
export async function cropToAvatar(bitmap: ImageBitmap, crop: Crop): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible");

  context.drawImage(
    bitmap,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  return encodeCanvas(canvas);
}

/** webp when the browser can, jpeg otherwise — Safari only gained webp recently. */
async function encodeCanvas(canvas: HTMLCanvasElement): Promise<File> {
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

  const blob = (await encode("image/webp")) ?? (await encode("image/jpeg"));
  if (!blob) throw new Error("Conversion impossible");

  const type = blob.type || "image/jpeg";
  return new File([blob], `avatar.${type === "image/webp" ? "webp" : "jpg"}`, { type });
}
