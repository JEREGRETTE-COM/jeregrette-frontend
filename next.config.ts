import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  //skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Hide the Next.js dev tools indicator (bottom-left badge).
  devIndicators: false,
  turbopack: {

  },

  // The share-image route reads these from disk; without this they are not
  // bundled into the serverless function and it fails with ENOENT in production.
  outputFileTracingIncludes: {
    "/regret/[id]/image": ["./public/fonts/**"],
  },
  images: {
    unoptimized: isCapacitorBuild ? true : undefined,
  },

  // Docker only. Vercel builds its own way: with "standalone" it stops at
  // "ENOENT .next/next-server.js.nft.json", so the Dockerfile sets this flag
  // and nothing else does.
  ...(!(process.env.DOCKER_BUILD === "1") ? {} : { output: isCapacitorBuild ? "export": "standalone" as const } ),
  
};

export default withPWA(nextConfig);;
