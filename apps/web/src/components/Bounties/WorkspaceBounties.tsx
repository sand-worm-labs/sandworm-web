"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { PiPlus } from "react-icons/pi";
import { toast } from "sonner";
import { Button } from "@sandworm/ui/components/button";

import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import {
  GetBountyDocument,
  useGetBountyDraftsQuery,
  useSubmitBountyEntryMutation,
  type GetBountyQuery,
} from "@/generated/graphql";
import {
  FundEscrowModal,
  type FundableBounty,
} from "@/web3/components/FundEscrowModal";

import { BountiesBoard } from "./BountiesBoard";
import {
  BountyCard,
  bountyButtonClass,
  bountyPrimaryButtonClass,
} from "./BountyCard";
import { bountyStarterPrompt, bountyTag, type BountyRef } from "./bounties";
import CreateBountyModal from "./CreateBountyModal";
import { SubmitEntryModal } from "./SubmitEntryModal";
import { useBountyEntries } from "./useBountyEntry";

// =====================================
// ⬢ Use Workspace Bounty Actions
// =====================================
export const useWorkspaceBountyActions = () => {
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const client = useApolloClient();
  const [documentsState, { createDocument, publish }] =
    useDocuments(workspaceId);
  const { entries, submitted, saveEntry, refetch } =
    useBountyEntries(workspaceId);
  const [submitEntry] = useSubmitBountyEntryMutation({
    refetchQueries: ["GetBountyEntries"],
  });
  const [busy, setBusy] = useState<string | null>(null);
  // The bounty whose wallet is being asked for
  const [asking, setAsking] = useState<string | null>(null);

  const onStart = useCallback(
    async (bounty: BountyRef) => {
      if (documentsState.loading) return;
      setBusy(bounty.slug);
      try {
        const doc = await createDocument({
          parentId: null,
          version: 2,
          title: bounty.title,
        });
        await saveEntry(bounty.slug, doc.id);
        // Open the notebook with the AI panel already asked for a starter
        // built from the full brief. Without the brief, open it empty.
        const prompt = await client
          .query<GetBountyQuery>({
            query: GetBountyDocument,
            variables: { slug: bounty.slug },
          })
          .then(({ data }) =>
            data?.getBounty ? bountyStarterPrompt(data.getBounty) : null
          )
          .catch(() => null);
        router.push(
          prompt
            ? `/workspace/${workspaceId}/documents/${doc.id}/notebook/edit?prompt=${encodeURIComponent(prompt)}&panel=ai`
            : `/workspace/${workspaceId}/documents/${doc.id}`
        );
      } catch (err) {
        console.error(err);
        setBusy(null);
      }
    },
    [
      documentsState.loading,
      createDocument,
      saveEntry,
      client,
      router,
      workspaceId,
    ]
  );

  const onSubmit = useCallback(
    async (bounty: BountyRef, documentId: string, wallet?: string) => {
      setBusy(bounty.slug);
      try {
        await publish(documentId, {
          description: `Entry for the bounty "${bounty.title}".`,
          tags: ["bounty", bountyTag(bounty.slug)],
        });
        await submitEntry({
          variables: { slug: bounty.slug, documentId, wallet },
        });
        await refetch();
        setAsking(null);
        toast.success("Entry submitted. Your notebook is now public.");
      } catch (err) {
        console.error(err);
        toast.error(
          err instanceof Error && err.message
            ? err.message
            : "Could not submit the entry. Please try again."
        );
      } finally {
        setBusy(null);
      }
    },
    [publish, submitEntry, refetch]
  );

  return (bounty: BountyRef) => {
    const isBusy = busy === bounty.slug;
    const entry = documentsState.documents.find(
      doc => doc.id === entries[bounty.slug] && doc.deletedAt === null
    );

    if (bounty.status !== "open" && !entry) return null;

    if (!entry) {
      return (
        <Button
          size="sm"
          className={bountyPrimaryButtonClass}
          disabled={isBusy || documentsState.loading}
          onClick={() => onStart(bounty)}
        >
          Start bounty
        </Button>
      );
    }

    // Entries from before the server kept them are known by their tag.
    const isSubmitted =
      submitted.has(bounty.slug) ||
      (!!entry.publishedAt && !!entry.tags?.includes(bountyTag(bounty.slug)));

    return (
      <>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className={bountyButtonClass}
        >
          <Link href={`/workspace/${workspaceId}/documents/${entry.id}`}>
            {isSubmitted ? "Edit entry" : "Continue entry"}
          </Link>
        </Button>
        {isSubmitted ? (
          <Button
            asChild
            size="sm"
            variant="secondary"
            className={bountyButtonClass}
          >
            <Link href={`/notebooks/${entry.slug ?? entry.id}`}>
              View submission
            </Link>
          </Button>
        ) : (
          bounty.status === "open" && (
            <Button
              size="sm"
              className={bountyPrimaryButtonClass}
              disabled={isBusy}
              title="Publishes this notebook so anyone can view it"
              onClick={() =>
                bounty.onchainId
                  ? setAsking(bounty.slug)
                  : onSubmit(bounty, entry.id)
              }
            >
              Publish and submit
            </Button>
          )
        )}
        <SubmitEntryModal
          isOpen={asking === bounty.slug}
          onClose={() => setAsking(null)}
          title={bounty.title}
          isSubmitting={isBusy}
          onSubmit={wallet => onSubmit(bounty, entry.id, wallet)}
        />
      </>
    );
  };
};

// =====================================
// ⬢ Workspace Bounties
// =====================================
export const WorkspaceBounties = () => {
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const renderActions = useWorkspaceBountyActions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [funding, setFunding] = useState<FundableBounty | null>(null);
  const { data: draftsData, refetch: refetchDrafts } = useGetBountyDraftsQuery({
    variables: { workspaceId },
    skip: !workspaceId,
  });
  const drafts = draftsData?.getBountyDrafts ?? [];
  const detailHref = (slug: string) =>
    `/workspace/${workspaceId}/bounties/${slug}`;

  const onCreated = (slug: string) => {
    refetchDrafts();
    router.push(detailHref(slug));
  };

  return (
    <>
      <BountiesBoard
        compact
        renderActions={renderActions}
        detailHref={detailHref}
        headerAction={
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="py-2 px-6 bg-primary-tint-75 dark:bg-base-700 hover:bg-primary/5 dark:hover:bg-base-600 rounded-xl hover:cursor-pointer text-sm border flex items-center shrink-0 border-accent-fuchsia dark:border-white/15 text-accent-fuchsia dark:text-white font-body font-medium gap-2 shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.04),0px_4px_4px_-2px_rgba(0,0,0,0.02)] dark:shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.12),0px_4px_4px_-2px_rgba(0,0,0,0.12)]"
          >
            <PiPlus className="h-4 w-4" />
            Create Bounty
          </button>
        }
      >
        {drafts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-ink-100 dark:text-white mb-3">
              Your drafts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {drafts.map(draft => (
                <BountyCard
                  key={draft.slug}
                  bounty={draft}
                  href={detailHref(draft.slug)}
                  actions={
                    <Button
                      size="sm"
                      className={bountyPrimaryButtonClass}
                      onClick={() => setFunding(draft)}
                    >
                      Fund escrow
                    </Button>
                  }
                />
              ))}
            </div>
          </section>
        )}
      </BountiesBoard>

      {funding && (
        <FundEscrowModal
          isOpen
          onClose={() => setFunding(null)}
          bounty={funding}
          onFunded={() => refetchDrafts()}
        />
      )}

      <CreateBountyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        workspaceId={workspaceId}
        onCreated={onCreated}
      />
    </>
  );
};
