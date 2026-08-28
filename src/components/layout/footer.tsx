import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm opacity-70">
        © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
      </div>
    </footer>
  );
}
