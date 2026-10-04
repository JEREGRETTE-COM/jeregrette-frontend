"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";

import { activeMention, insertMention } from "@/lib/mentions";

export type MentionSuggestion = {
  id: string;
  username: string;
  avatar: string | null;
  certified: boolean;
};

/** Long enough to skip the keystrokes of a word typed in one go. */
const DEBOUNCE_MS = 200;

/**
 * @mention suggestions for an uncontrolled textarea. Attach `textarea` as its
 * ref, call `update` on input and clicks, pass `onKeyDown`; picking a user
 * rewrites the @word in place and calls `onInsert` (the composer re-measures
 * its height).
 */
export function useMentionAutocomplete(onInsert?: () => void) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [active, setActive] = useState(0);
  // Where the @word being typed sits, read again on every keystroke.
  const target = useRef<{ start: number; caret: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const request = useRef<AbortController | null>(null);

  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    request.current?.abort();
    target.current = null;
    setSuggestions([]);
  }, []);

  const update = useCallback(() => {
    const field = textarea.current;
    if (!field) return;
    const caret = field.selectionStart;
    const found =
      caret === field.selectionEnd ? activeMention(field.value, caret) : null;
    if (!found?.query) {
      close();
      return;
    }

    target.current = { start: found.start, caret };
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      request.current?.abort();
      const controller = new AbortController();
      request.current = controller;
      try {
        const query = new URLSearchParams({ q: found.query });
        const response = await fetch(`/api/users/search?${query}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const { data } = response.ok
          ? ((await response.json()) as { data?: MentionSuggestion[] })
          : { data: [] };
        setSuggestions(data ?? []);
        setActive(0);
      } catch {
        // Aborted by the next keystroke, or offline: no suggestions is fine.
      }
    }, DEBOUNCE_MS);
  }, [close]);

  const select = useCallback(
    (user: MentionSuggestion) => {
      const field = textarea.current;
      const at = target.current;
      if (!field || !at) return;
      const next = insertMention(field.value, at.start, at.caret, user.username);
      field.value = next.value;
      field.focus();
      field.setSelectionRange(next.caret, next.caret);
      close();
      onInsert?.();
    },
    [close, onInsert],
  );

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (suggestions.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      select(suggestions[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      request.current?.abort();
    },
    [],
  );

  return { textarea, suggestions, active, update, onKeyDown, select, close };
}
