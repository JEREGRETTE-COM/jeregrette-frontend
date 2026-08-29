import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="max-w-prose opacity-70">Page à compléter.</p>
    </section>
  );
}
