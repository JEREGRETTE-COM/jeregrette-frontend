import type { Metadata } from "next";

import { RegretComposer } from "@/components/compose/regret-composer";

export const metadata: Metadata = {
  title: "Publier mon regret",
};

/**
 * Open to everyone: the guest session is created when the regret is sent, so a
 * visitor writes first and is never bounced to a sign-up form beforehand.
 */
export default function ComposePage() {
  return <RegretComposer />;
}
