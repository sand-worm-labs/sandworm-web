"use client";

import Link from "next/link";

import { AuthorCell } from "@/components/Explore/AuthorCell";
import { ListTable } from "@/components/Explore/ListTable";
import { listCellClass, listRowClass } from "@/components/Showcase/BoardKit";
import { useGetBountyEntriesQuery } from "@/generated/graphql";
import { formatDay, shortAddress } from "@/web3/format";

const HEADERS = ["Author", "Notebook", "Wallet"] as const;

export const BountyEntries = ({ slug }: { slug: string }) => {
  const { data } = useGetBountyEntriesQuery({ variables: { slug } });
  const entries = data?.getBountyEntries ?? [];
  if (entries.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-bold text-ink-100 dark:text-white">
        Submissions ({entries.length})
      </h2>
      <ListTable headers={HEADERS}>
        {entries.map(entry => (
          <tr key={entry.id} className={listRowClass}>
            <td className={listCellClass}>
              <AuthorCell
                username={`${entry.author}${entry.isMine ? " (you)" : ""}`}
                date={
                  entry.submittedAt ? formatDay(entry.submittedAt) : undefined
                }
              />
            </td>
            <td className={`${listCellClass} md:max-w-xs`}>
              <Link
                href={`/notebooks/${entry.notebookSlug ?? entry.documentId}`}
                className="text-sm font-medium text-ink-100 dark:text-white hover:underline break-words"
              >
                {entry.notebookTitle || "Untitled notebook"}
              </Link>
            </td>
            <td className={`${listCellClass} md:text-right`}>
              {entry.wallet && (
                <span
                  className="font-body-mono text-xs text-ink-400"
                  title={entry.wallet}
                >
                  {shortAddress(entry.wallet)}
                </span>
              )}
            </td>
          </tr>
        ))}
      </ListTable>
    </section>
  );
};
