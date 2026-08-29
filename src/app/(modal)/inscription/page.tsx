import type { Metadata } from "next";

import { SignupCard } from "@/components/auth/signup-card";

export const metadata: Metadata = {
  title: "Inscription",
};

export default function SignupPage() {
  return <SignupCard />;
}
