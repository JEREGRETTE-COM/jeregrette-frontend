import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

/** `modal` is the @modal slot: filled only when a route is intercepted into a dialog. */
export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    // Browser extensions inject attributes on <html> before React hydrates.
    <html
      lang="fr"
      className={`${geistSans.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
      </body>
    </html>
  );
}
