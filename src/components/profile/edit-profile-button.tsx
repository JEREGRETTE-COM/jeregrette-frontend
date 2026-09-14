"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { updateProfileAction } from "@/app/actions";
import { Dialog } from "@/components/ui/dialog";
import { initial, isHttpsUrl } from "@/lib/utils";

/** Backend rules on PATCH /users/me. */
const MAX_BIO = 280;
const MAX_AVATAR_URL = 2048;

type Profile = { username: string; bio: string; avatarUrl: string };

const fieldClassName =
  "bg-field-alt w-full rounded-[15px] px-[16px] text-[15px] text-white outline-none placeholder:text-white/35";
const labelClassName = "text-muted mb-[6px] block text-[13px]";

/**
 * Opens the profile editor: username, photo and bio. `icon` is the pencil of
 * Figma 167:994 in the profile header; `text` is the prompt shown where an empty
 * bio would be. The API takes the photo as a link: there is no upload route.
 */
export function EditProfileButton({
  profile,
  variant = "icon",
}: {
  profile: Profile;
  variant?: "icon" | "text";
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [brokenPhoto, setBrokenPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openEditor() {
    setDraft(profile);
    setBrokenPhoto(false);
    setError(null);
    setOpen(true);
  }

  function change(field: keyof Profile, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "avatarUrl") setBrokenPhoto(false);
  }

  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  const photo = draft.avatarUrl.trim();
  const photoIsLink = isHttpsUrl(photo);
  const changed =
    draft.username.trim().replace(/^@/, "") !== profile.username ||
    draft.bio.trim() !== profile.bio.trim() ||
    photo !== profile.avatarUrl;

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        aria-label="Modifier le profil"
        onClick={openEditor}
        className="ml-auto flex size-[35px] shrink-0 items-center justify-center transition-opacity hover:opacity-80"
      >
        <Image
          src="/icons/edit.svg"
          alt=""
          width={14}
          height={14}
          unoptimized
          className="h-[13.9333px] w-[13.9333px]"
        />
      </button>
    ) : (
      <button
        type="button"
        onClick={openEditor}
        className="text-label text-[14px] underline-offset-2 transition-colors hover:text-white hover:underline"
      >
        Ajouter une bio
      </button>
    );

  return (
    <>
      {trigger}

      {/*
        Rendered into <body>: the profile header is sticky with a z-index, and a
        fixed overlay nested inside that stacking context would sit under the page.
      */}
      {open
        ? createPortal(
            <Dialog label="Modifier le profil" onClose={() => setOpen(false)}>
              <form
                action={save}
                className="bg-surface flex max-h-[calc(100dvh-40px)] w-full flex-col overflow-y-auto rounded-[25px] border-[0.5px] border-white/10 p-[22px]"
              >
                <p className="text-[18px] font-semibold text-white">Modifier le profil</p>

                {/* photo: a link, previewed as soon as it is a valid https URL */}
                <div className="mt-[18px] flex items-center gap-[14px]">
                  {photoIsLink && !brokenPhoto ? (
                    <Image
                      key={photo}
                      src={photo}
                      alt=""
                      width={64}
                      height={64}
                      unoptimized
                      onError={() => setBrokenPhoto(true)}
                      className="h-[64px] w-[64px] shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full bg-white/20 text-[26px] font-semibold text-white"
                    >
                      {initial(draft.username || profile.username)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <label htmlFor="profile-avatar" className={labelClassName}>
                      Lien de ta photo (facultatif)
                    </label>
                    <div className="flex gap-[8px]">
                      <input
                        id="profile-avatar"
                        name="avatar_url"
                        type="url"
                        inputMode="url"
                        value={draft.avatarUrl}
                        onChange={(event) => change("avatarUrl", event.target.value)}
                        maxLength={MAX_AVATAR_URL}
                        placeholder="https://…"
                        className={`${fieldClassName} h-[42px] min-w-0`}
                      />
                      {photo ? (
                        <button
                          type="button"
                          onClick={() => change("avatarUrl", "")}
                          className="h-[42px] shrink-0 rounded-[15px] px-[12px] text-[13px] text-white transition-colors hover:bg-white/5"
                        >
                          Retirer
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="text-danger mt-[6px] min-h-[16px] text-[12px]">
                  {photo && !photoIsLink
                    ? "Le lien doit commencer par https://"
                    : brokenPhoto
                      ? "Impossible d’afficher cette image."
                      : null}
                </p>

                <label htmlFor="profile-username" className={`${labelClassName} mt-[10px]`}>
                  Nom d’utilisateur
                </label>
                <div className="bg-field-alt flex h-[46px] items-center rounded-[15px] pl-[16px]">
                  <span aria-hidden className="text-muted text-[15px]">
                    @
                  </span>
                  <input
                    id="profile-username"
                    name="username"
                    value={draft.username}
                    onChange={(event) => change("username", event.target.value)}
                    required
                    minLength={3}
                    maxLength={30}
                    pattern="[A-Za-z0-9_]+"
                    title="3 à 30 caractères : lettres, chiffres ou _"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="h-full min-w-0 flex-1 bg-transparent pl-[2px] pr-[16px] text-[15px] text-white outline-none"
                  />
                </div>

                <label htmlFor="profile-bio" className={`${labelClassName} mt-[14px]`}>
                  Bio
                </label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  value={draft.bio}
                  onChange={(event) => change("bio", event.target.value)}
                  maxLength={MAX_BIO}
                  rows={4}
                  autoFocus={variant === "text"}
                  placeholder="Dis quelque chose sur toi…"
                  className={`${fieldClassName} resize-none py-[12px]`}
                />

                <div className="mt-[8px] flex items-center justify-between gap-[12px] text-[12px]">
                  <span className="text-danger min-h-[16px]">{error}</span>
                  <span className={draft.bio.length >= MAX_BIO ? "text-danger" : "text-muted"}>
                    {draft.bio.length}/{MAX_BIO}
                  </span>
                </div>

                <div className="mt-[16px] flex gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-[46px] flex-1 rounded-[23px] border-[0.5px] border-[#c5c5c5] text-[15px] font-medium text-white transition-colors hover:bg-white/5"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !changed}
                    className="h-[46px] flex-1 rounded-[23px] bg-white text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {pending ? "…" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </Dialog>,
            document.body,
          )
        : null}
    </>
  );
}
