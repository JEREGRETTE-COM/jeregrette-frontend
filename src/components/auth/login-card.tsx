"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, type FormState } from "@/app/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";

export function LoginCard() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    signInAction,
    {},
  );

  return (
    <AuthCard title="Connexion à" highlight="jeregrette.com">
      <form action={formAction} className="flex flex-1 flex-col">
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Adresse Email"
          autoComplete="email"
          className="mt-[21px]"
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          autoComplete="current-password"
          className="mt-[11px]"
        />

        <Link
          href="/mot-de-passe-oublie"
          className="text-muted mt-[18px] shrink-0 self-start text-[14px] font-light leading-none underline"
        >
          Mot de passe oublié ?
        </Link>

        {state.error ? (
          <p className="text-required mt-[12px] shrink-0 text-[14px] leading-none">{state.error}</p>
        ) : null}

        <p className="mt-[24px] shrink-0 text-[14px] font-light leading-none text-white sm:mt-auto">
          Pas encore regretteur(euse) ?{" "}
          <Link href="/inscription" className="font-semibold underline">
            Créer un compte
          </Link>
        </p>

        <Button
          type="submit"
          disabled={pending}
          className="mb-[33px] mt-[29px] h-[50px] w-full shrink-0 rounded-[25px] bg-white text-[15px] font-semibold text-black hover:bg-white/90"
        >
          {pending ? "…" : "Se connecter"}
        </Button>
      </form>
    </AuthCard>
  );
}
