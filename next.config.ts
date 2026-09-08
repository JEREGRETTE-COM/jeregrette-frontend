import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev tools indicator (bottom-left badge).
  devIndicators: false,

  // The share-image route reads these from disk; without this they are not
  // bundled into the serverless function and it fails with ENOENT in production.
  outputFileTracingIncludes: {
    "/regret/[id]/image": ["./public/fonts/**", "./public/avatars/**"],
  },
};

export default nextConfig;
