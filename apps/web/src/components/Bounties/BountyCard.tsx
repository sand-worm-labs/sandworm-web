import Link from "next/link";
import { PiTrophy } from "react-icons/pi";

import type { Bounty } from "./bounties";

const chip =
  "text-[11px] font-medium px-2 py-0.5 rounded-md bg-base-300 dark:bg-base-700 text-ink-400 whitespace-nowrap";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  judging: "Judging",
  closed: "Closed",
};

interface BountyCardProps {
  bounty: Bounty;
  // The buttons for this bounty: they differ for visitors and workspace members.
  actions: React.ReactNode;
}

export const BountyCard = ({ bounty, actions }: BountyCardProps) => (
  <article className="rounded-3xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-6 flex flex-col h-full font-body">
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={chip}>{bounty.type}</span>
      <span className={chip}>
        {STATUS_LABEL[bounty.status] ?? bounty.status}
      </span>
      {bounty.sample && <span className={chip}>Past bounty</span>}
    </div>

    <h3 className="mt-3 text-[0.95rem] font-bold text-ink-100 dark:text-white">
      {bounty.title}
    </h3>
    <p className="mt-1 text-xs text-ink-400">
      Sponsored by {bounty.sponsor}
      {bounty.sourceUrl && (
        <>
          {" · "}
          <a
            href={bounty.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Original post
          </a>
        </>
      )}
    </p>

    <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-400 dark:text-gray-300">
      {bounty.summary}
    </p>

    {bounty.judging.length > 0 && (
      <ul className="mt-3 space-y-1 text-xs text-ink-400 list-disc pl-4">
        {bounty.judging.map(line => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    )}

    {bounty.winners.length > 0 && (
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-100 dark:text-white">
          <PiTrophy size={14} /> Winners
        </p>
        <ul className="mt-1.5 space-y-1 text-xs text-ink-400">
          {bounty.winners.map(winner => (
            <li key={winner.notebookSlug}>
              {winner.place}:{" "}
              <Link
                href={`/notebooks/${winner.notebookSlug}`}
                className="text-ink-100 dark:text-white hover:underline"
              >
                @{winner.author}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )}

    <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-semibold text-ink-100 dark:text-white">
        {bounty.reward ?? "Reward set by sponsor"}
      </p>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  </article>
);
