"use client";

import Image from "next/image";

import type { MentionSuggestion } from "@/components/compose/use-mention-autocomplete";
import { cn, initial } from "@/lib/utils";

export const MENTION_LIST_ID = "mention-suggestions";

/** The users matching the @word being typed. */
export function MentionSuggestions({
  suggestions,
  active,
  onSelect,
  className,
}: {
  suggestions: MentionSuggestion[];
  active: number;
  onSelect: (user: MentionSuggestion) => void;
  className?: string;
}) {
  if (suggestions.length === 0) return null;

  return (
    <ul
      id={MENTION_LIST_ID}
      role="listbox"
      aria-label="Mentionner quelqu’un"
      className={cn(
        "z-20 flex max-h-[240px] flex-col overflow-y-auto rounded-[12px] bg-[#1f1f1f] py-[6px] shadow-lg",
        className,
      )}
    >
      {suggestions.map((user, index) => (
        <li key={user.id} role="option" aria-selected={index === active}>
          <button
            type="button"
            // keeps the textarea focused, so its caret is still there to insert at
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(user)}
            className={cn(
              "flex w-full items-center gap-[10px] px-[12px] py-[8px] text-left text-[14px] text-white transition-colors hover:bg-white/10",
              index === active && "bg-white/10",
            )}
          >
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-white/20 text-[12px] font-semibold">
                {initial(user.username)}
              </span>
            )}
            <span className="truncate font-medium">@{user.username}</span>
            {user.certified ? (
              <Image
                src="/icons/verified.svg"
                alt="Compte certifié"
                width={14}
                height={14}
                unoptimized
                className="h-[14px] w-[14px] shrink-0"
              />
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
