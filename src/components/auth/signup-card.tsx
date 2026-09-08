"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type FormState } from "@/app/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthField } from "@/components/auth/auth-field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";

export function SignupCard() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    signUpAction,
    {},
  );

  return (
    <AuthCard title="Bienvenue sur" highlight="jeregrette.com">
      <form action={formAction} className="flex flex-1 flex-col">
        <OAuthButtons />
        <AuthDivider />
        <AuthField
          id="username"
          name="username"
          type="text"
          label="Nom d’utilisateur"
          autoComplete="username"
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_]+"
          className="mt-[21px]"
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Adresse Email"
          autoComplete="email"
          className="mt-[11px]"
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          autoComplete="new-password"
          minLength={8}
          className="mt-[11px]"
        />
        <AuthField
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          minLength={8}
          className="mt-[11px]"
        />

        <p className="mt-[18px] shrink-0 text-[14px] font-light leading-none text-white">
          Vous êtes déja regretteur(euse) ?{" "}
          <Link href="/connexion" className="font-semibold underline">
            Se connecter
          </Link>
        </p>

        {state.error ? (
          <p className="text-required mt-[12px] shrink-0 text-[14px] leading-none">{state.error}</p>
        ) : null}

        <p className="text-legal mx-auto mt-[24px] max-w-[343px] shrink-0 text-center text-[14px] leading-[15px]">
          En continuant, tu acceptes notre
          <br />
          <Link href="/contrat-utilisation" className="font-semibold text-white underline">
            Contrat d&rsquo;utilisation
          </Link>{" "}
          et reconnais que tu comprends notre{" "}
          <Link href="/confidentialite" className="font-semibold text-white underline">
            Politique de confidentialité
          </Link>
          .
        </p>

        <Button
          type="submit"
          disabled={pending}
          className="mb-[33px] mt-[29px] h-[50px] w-full shrink-0 rounded-[25px] bg-white text-[15px] font-semibold text-black hover:bg-white/90"
        >
          {pending ? "…" : "Continuer"}
        </Button>
      </form>
    </AuthCard>
  );
}
