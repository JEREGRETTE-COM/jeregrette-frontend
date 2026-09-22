import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ships a self-contained server under .next/standalone, so the Docker image
  // holds only the files the app actually runs, without node_modules.
  output: "standalone",

  // Hide the Next.js dev tools indicator (bottom-left badge).
  devIndicators: false,

  // The share-image route reads these from disk; without this they are not
  // bundled into the serverless function and it fails with ENOENT in production.
  outputFileTracingIncludes: {
    "/regret/[id]/image": ["./public/fonts/**"],
  },
};

export default nextConfig;
