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
