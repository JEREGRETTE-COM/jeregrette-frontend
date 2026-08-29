import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos",
};

export default function AboutPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">À propos</h1>
      <p className="max-w-prose opacity-70">Page à compléter.</p>
    </section>
  );
}
