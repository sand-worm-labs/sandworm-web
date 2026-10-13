"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApolloClient } from "@apollo/client";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@sandworm/ui/components/button";

import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";
import {
  GetBountyDocument,
  useSubmitBountyEntryMutation,
  type GetBountyQuery,
} from "@/generated/graphql";

import { bountyTag, type BountyRef } from "./bounties";
import { bountyStarterPrompt } from "./bountyPrompt";
import { SubmitEntryModal, type EntryNotebook } from "./SubmitEntryModal";
import { bountyButtonClass, bountyPrimaryButtonClass } from "./styles";
import { useBountyEntries } from "./useBountyEntry";

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
  // The slug of the bounty whose submit modal is open
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

  const notebooks: EntryNotebook[] = documentsState.documents
    .filter(doc => doc.deletedAt === null)
    .sortBy(doc => -new Date(doc.updatedAt).getTime())
    .map(doc => ({ id: doc.id, title: doc.title }))
    .toArray();

  return (bounty: BountyRef) => {
    const isBusy = busy === bounty.slug;
    const entry = documentsState.documents.find(
      doc => doc.id === entries[bounty.slug] && doc.deletedAt === null
    );

    if (bounty.status !== "open" && !entry) return null;

    const submitModal = (
      <SubmitEntryModal
        workspaceId={workspaceId}
        isOpen={asking === bounty.slug}
        onClose={() => setAsking(null)}
        title={bounty.title}
        isSubmitting={isBusy}
        notebooks={notebooks}
        defaultNotebookId={entry?.id}
        needsWallet={!!bounty.onchainId}
        onSubmit={(documentId, wallet) => onSubmit(bounty, documentId, wallet)}
      />
    );

    if (!entry) {
      return (
        <>
          <Button
            size="sm"
            className={bountyPrimaryButtonClass}
            disabled={isBusy || documentsState.loading}
            onClick={() => onStart(bounty)}
          >
            Start bounty
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className={bountyButtonClass}
            disabled={isBusy || documentsState.loading}
            title="Enter a notebook you already have"
            onClick={() => setAsking(bounty.slug)}
          >
            Submit a notebook
          </Button>
          {submitModal}
        </>
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
              title="Publishes a notebook so anyone can view it"
              onClick={() => setAsking(bounty.slug)}
            >
              Publish and submit
            </Button>
          )
        )}
        {submitModal}
      </>
    );
  };
};
