import type { Metadata } from "next";

import { LoginCard } from "@/components/auth/login-card";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginCard next={safeNext(next)} />;
}
