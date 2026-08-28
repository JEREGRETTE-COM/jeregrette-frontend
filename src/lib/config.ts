export const siteConfig = {
  name: "Jeregrette",
  description: "Application web Jeregrette.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jeregrette.com",
  nav: [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
