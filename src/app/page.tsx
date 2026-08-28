import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-6">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {siteConfig.name}
      </h1>
      <p className="max-w-prose text-base opacity-70">{siteConfig.description}</p>
      <div className="flex gap-3">
        <Button>Commencer</Button>
        <Button variant="outline">En savoir plus</Button>
      </div>
    </section>
  );
}
