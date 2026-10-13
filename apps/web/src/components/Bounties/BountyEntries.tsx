"use client";

import Link from "next/link";
import { PiSealCheck } from "react-icons/pi";
import { monad } from "viem/chains";

import { AuthorCell } from "@/components/Explore/AuthorCell";
import { ListTable } from "@/components/Explore/ListTable";
import { listCellClass, listRowClass } from "@/components/Showcase/BoardKit";
import { useGetBountyEntriesQuery } from "@/generated/graphql";
import { explorerTxUrl } from "@/web3/config";
import { formatDay, shortAddress } from "@/web3/format";

const HEADERS = ["Author", "Notebook", "Trust", "Wallet"] as const;

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
            <td className={listCellClass}>
              {entry.trusted && entry.attestation?.responseTx ? (
                <a
                  href={explorerTxUrl(monad, entry.attestation.responseTx)}
                  target="_blank"
                  rel="noreferrer"
                  title={`Inputs committed onchain by agent ${entry.attestation.agentId}, checked by ${shortAddress(entry.attestation.validator)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 hover:underline"
                >
                  <PiSealCheck size={14} /> Verified
                </a>
              ) : (
                <span className="text-xs text-ink-400">Not verified</span>
              )}
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
