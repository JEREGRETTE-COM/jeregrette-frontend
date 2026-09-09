import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getAccessToken } from "@/lib/auth";
import { toRegret } from "@/lib/feed-mapping";
import { getPost } from "@/lib/posts";
import { initial, regretFontSize } from "@/lib/utils";

/** Square, the format WhatsApp previews best. */
const SIZE = 1080;
/** The feed card is 599px wide; scale its geometry up to SIZE. */
const SCALE = SIZE / 599;
const px = (value: number) => Math.round(value * SCALE);

const asset = (...parts: string[]) => join(process.cwd(), "public", ...parts);

/**
 * Read from disk rather than fetch(new URL(..., import.meta.url)): Node's fetch
 * cannot open file: URLs, and the Edge runtime would get its own copy of the
 * in-memory store.
 */
const fonts = {
  semibold: readFileSync(asset("fonts", "poppins-600.ttf")),
  black: readFileSync(asset("fonts", "poppins-900.ttf")),
};

/**
 * Avatars are either a remote avatar_url from the API, which satori fetches on
 * its own, or one of the bundled placeholders, which must be inlined.
 */
function avatarSource(avatar: string) {
  if (/^https?:\/\//.test(avatar)) return avatar;
  try {
    const bytes = readFileSync(asset(avatar.replace(/^\//, "")));
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Satori has no `inset` shorthand — every layer states its own box. */
const fill = { position: "absolute" as const, top: 0, left: 0, width: SIZE, height: SIZE };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = await getAccessToken();
  if (!token) return new Response("Unauthorized", { status: 401 });

  let regret;
  try {
    regret = toRegret(await getPost(id, token));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const avatar = regret.author.avatar ? avatarSource(regret.author.avatar) : null;

  return new ImageResponse(
    (
      <div
        style={{
          ...fill,
          position: "relative",
          display: "flex",
          backgroundColor: regret.background,
          fontFamily: "Poppins",
        }}
      >
        {/* the card's dark top-down overlay */}
        <div
          style={{
            ...fill,
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)",
          }}
        />

        <div
          style={{
            ...fill,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: px(30),
          }}
        >
          <div
            style={{
              display: "flex",
              width: px(331),
              textAlign: "center",
              fontSize: px(regretFontSize(regret.text)),
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
            }}
          >
            {regret.text}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: px(11),
            top: px(10),
            display: "flex",
            alignItems: "center",
          }}
        >
          {avatar ? (
            <>
              {/* satori renders plain elements — next/image does not apply here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={avatar}
                width={px(35)}
                height={px(35)}
                style={{ borderRadius: px(35), objectFit: "cover" }}
              />
            </>
          ) : (
            <div
              style={{
                width: px(35),
                height: px(35),
                borderRadius: px(35),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                fontSize: px(15),
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              {initial(regret.author.handle)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", marginLeft: px(12) }}>
            <span style={{ fontSize: px(14), fontWeight: 600, color: "#ffffff" }}>
              {regret.author.handle}
            </span>
            <span style={{ fontSize: px(10), color: "#afafaf", marginTop: px(4) }}>
              {regret.time}
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            top: SIZE - px(40),
            width: SIZE,
            display: "flex",
            justifyContent: "center",
            fontSize: px(16),
            fontWeight: 900,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          jeregrette.com
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      // Regrets are full of emoji; satori needs a source for them.
      emoji: "noto",
      fonts: [
        { name: "Poppins", data: fonts.semibold, weight: 600, style: "normal" },
        { name: "Poppins", data: fonts.black, weight: 900, style: "normal" },
      ],
    },
  );
}
