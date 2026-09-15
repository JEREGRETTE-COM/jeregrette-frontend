import type { Metadata } from "next";

import { SignupCard } from "@/components/auth/signup-card";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Inscription",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <SignupCard next={safeNext(next)} />;
}
