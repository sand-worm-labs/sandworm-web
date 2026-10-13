"use client";

import Link from "next/link";

import { useGetBountyEntriesQuery } from "@/generated/graphql";
import { formatDay, shortAddress } from "@/web3/format";

// =====================================
// ⬢ Bounty Entries
// =====================================
// The notebooks submitted to a bounty. Each is published, so anyone can open
// it. The wallet shows only to the sponsor and to the entry's own author.
export const BountyEntries = ({ slug }: { slug: string }) => {
  const { data } = useGetBountyEntriesQuery({ variables: { slug } });
  const entries = data?.getBountyEntries ?? [];
  if (entries.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold text-ink-100 dark:text-white mb-2">
        Submissions ({entries.length})
      </h2>
      <ul className="divide-y divide-border-secondary dark:divide-border-tertiary rounded-2xl border border-border-secondary dark:border-border-tertiary">
        {entries.map(entry => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-xs"
          >
            <div className="min-w-0">
              <Link
                href={`/notebooks/${entry.notebookSlug ?? entry.documentId}`}
                className="block truncate text-[0.85rem] font-medium text-ink-100 dark:text-white hover:underline"
              >
                {entry.notebookTitle || "Untitled notebook"}
              </Link>
              <p className="mt-0.5 text-ink-400">
                @{entry.author}
                {entry.isMine && " (you)"}
                {entry.submittedAt && ` · ${formatDay(entry.submittedAt)}`}
              </p>
            </div>
            {entry.wallet && (
              <span
                className="shrink-0 font-body-mono text-ink-400"
                title={entry.wallet}
              >
                {shortAddress(entry.wallet)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
