import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev tools indicator (bottom-left badge).
  devIndicators: false,

  // The share-image route reads these from disk; without this they are not
  // bundled into the serverless function and it fails with ENOENT in production.
  outputFileTracingIncludes: {
    "/regret/[id]/image": ["./public/fonts/**"],
  },

  // Docker only. Vercel builds its own way: with "standalone" it stops at
  // "ENOENT .next/next-server.js.nft.json", so the Dockerfile sets this flag
  // and nothing else does.
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
