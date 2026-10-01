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
  output: isCapacitorBuild ? "export": "standalone",
  
};

export default withPWA(nextConfig);;
