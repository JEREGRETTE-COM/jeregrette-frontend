import Link from "next/link";

import { siteConfig } from "@/lib/config";

export function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold">
          {siteConfig.name}
        </Link>
        <nav className="flex gap-6 text-sm">
          {siteConfig.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
