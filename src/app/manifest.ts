import { siteConfig } from '@/lib/config';
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.short_name,
    description: siteConfig.pwa_description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon_192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon_512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}