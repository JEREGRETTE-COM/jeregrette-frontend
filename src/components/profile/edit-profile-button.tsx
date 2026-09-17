"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { updateProfileAction, uploadAvatarAction } from "@/app/actions";
import { Dialog } from "@/components/ui/dialog";
import { toSquareAvatar } from "@/lib/image";
import { initial, isHttpsUrl } from "@/lib/utils";

/** Backend rules on PATCH /users/me. */
const MAX_BIO = 280;
const MAX_AVATAR_URL = 2048;
/** Ceiling before shrinking; a phone photo is well under it. */
const MAX_PICK_BYTES = 10 * 1024 * 1024;

type Profile = { username: string; bio: string; avatarUrl: string };

const fieldClassName =
  "bg-field-alt w-full rounded-[15px] px-[16px] text-[15px] text-white outline-none placeholder:text-white/35";
const labelClassName = "text-muted mb-[6px] block text-[13px]";

/**
 * Opens the profile editor: photo, username and bio. `icon` is the pencil of
 * Figma 167:994 in the profile header; `text` is the prompt shown where an empty
 * bio would be. A picked photo is cropped square and shrunk in the browser,
 * then sent to the backend, which stores it and returns its URL.
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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [brokenPhoto, setBrokenPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const picker = useRef<HTMLInputElement>(null);

  // The preview lives in browser memory until it is replaced or the editor closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function openEditor() {
    setDraft(profile);
    setFile(null);
    setPreview(null);
    setBrokenPhoto(false);
    setError(null);
    setOpen(true);
  }

  function change(field: keyof Profile, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field === "avatarUrl") setBrokenPhoto(false);
  }

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    // Clear it, or picking the same file twice in a row fires nothing.
    event.target.value = "";
    if (!picked) return;

    if (!picked.type.startsWith("image/")) {
      setError("Choisis une image.");
      return;
    }
    if (picked.size > MAX_PICK_BYTES) {
      setError("Photo trop lourde : 10 Mo maximum.");
      return;
    }

    setError(null);
    setPreparing(true);
    try {
      const square = await toSquareAvatar(picked);
      setFile(square);
      setPreview(URL.createObjectURL(square));
      setBrokenPhoto(false);
    } catch {
      setError("Impossible de lire cette image.");
    } finally {
      setPreparing(false);
    }
  }

  function removePhoto() {
    setFile(null);
    setPreview(null);
    change("avatarUrl", "");
  }

  function save(formData: FormData) {
    startTransition(async () => {
      let avatarUrl = draft.avatarUrl.trim();

      if (file) {
        const upload = new FormData();
        upload.set("avatar", file);
        const sent = await uploadAvatarAction(upload);
        if (sent.error || !sent.url) {
          setError(sent.error ?? "L’envoi de la photo a échoué.");
          return;
        }
        avatarUrl = sent.url;
      }

      formData.set("avatar_url", avatarUrl);
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
  const shownPhoto = preview ?? (photoIsLink && !brokenPhoto ? photo : null);
  const changed =
    file !== null ||
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

                <div className="mt-[18px] flex items-center gap-[14px]">
                  {shownPhoto ? (
                    <Image
                      key={shownPhoto}
                      src={shownPhoto}
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

                  <div className="flex min-w-0 flex-1 flex-col gap-[8px]">
                    {/* accept="image/*" opens the gallery, or the camera on a phone */}
                    <input
                      ref={picker}
                      type="file"
                      accept="image/*"
                      onChange={pick}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-[8px]">
                      <button
                        type="button"
                        onClick={() => picker.current?.click()}
                        disabled={preparing}
                        className="h-[42px] rounded-[15px] bg-white px-[16px] text-[14px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                      >
                        {preparing ? "Préparation…" : "Choisir une photo"}
                      </button>
                      {shownPhoto ? (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="h-[42px] rounded-[15px] border-[0.5px] border-[#c5c5c5] px-[14px] text-[13px] text-white transition-colors hover:bg-white/5"
                        >
                          Retirer
                        </button>
                      ) : null}
                    </div>
                    <p className="text-label text-[12px]">
                      {file
                        ? `Prête à envoyer (${Math.max(1, Math.round(file.size / 1024))} Ko)`
                        : "JPG, PNG ou WebP. Recadrée en carré automatiquement."}
                    </p>
                  </div>
                </div>

                <label htmlFor="profile-avatar" className={`${labelClassName} mt-[14px]`}>
                  Ou colle le lien d’une photo (facultatif)
                </label>
                <input
                  id="profile-avatar"
                  name="avatar_url"
                  type="url"
                  inputMode="url"
                  value={draft.avatarUrl}
                  onChange={(event) => change("avatarUrl", event.target.value)}
                  maxLength={MAX_AVATAR_URL}
                  placeholder="https://…"
                  disabled={file !== null}
                  className={`${fieldClassName} h-[42px] disabled:opacity-40`}
                />
                <p className="text-danger mt-[6px] min-h-[16px] text-[12px]">
                  {photo && !photoIsLink && !file
                    ? "Le lien doit commencer par https://"
                    : brokenPhoto && !file
                      ? "Impossible d’afficher cette image."
                      : null}
                </p>

                <label htmlFor="profile-username" className={`${labelClassName} mt-[6px]`}>
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
                    disabled={pending || preparing || !changed}
                    className="h-[46px] flex-1 rounded-[23px] bg-white text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    {pending ? "Envoi…" : "Enregistrer"}
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
