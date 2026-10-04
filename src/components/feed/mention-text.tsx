import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { splitMentions, type Mention } from "@/lib/mentions";

/** A post's text with each resolved @handle linking to that profile. */
export function MentionText({
  text,
  mentions,
  renderPlain = (plain) => plain,
}: {
  text: string;
  mentions: Mention[];
  /** For the plain stretches, e.g. the regret card's underlined domain. */
  renderPlain?: (plain: string) => ReactNode;
}) {
  return splitMentions(text, mentions).map((segment, index) =>
    segment.kind === "mention" ? (
      <Link key={index} href={`/u/${segment.id}`} className="font-bold hover:underline">
        {segment.text}
      </Link>
    ) : (
      <Fragment key={index}>{renderPlain(segment.text)}</Fragment>
    ),
  );
}
