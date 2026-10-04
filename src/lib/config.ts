 
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_ENV == "production" ? "Jeregrette" : "Jeregrette - TEST",
  short_name: process.env.NEXT_PUBLIC_SITE_ENV == "production" ? "Jeregrette" : "Jeregrette - TEST",
  pwa_description: process.env.NEXT_PUBLIC_SITE_ENV == "production" ? "Jeregrette" : "Jeregrette - TEST" + " - Application web progressive",
  description: "Application web Jeregrette.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jeregrette.com",
  nav: [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
