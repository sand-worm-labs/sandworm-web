"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@sandworm/ui/components/button";

import { useDocuments } from "@/components/Editor/hooks/useDocuments";
import { useStringQuery } from "@/components/Editor/hooks/useQueryArgs";

import { BountiesBoard } from "./BountiesBoard";
import { bountyButtonClass, bountyPrimaryButtonClass } from "./BountyCard";
import { bountyTag, type BountyRef } from "./bounties";
import { useBountyEntries } from "./useBountyEntry";

// =====================================
// ⬢ Use Workspace Bounty Actions
// =====================================
export const useWorkspaceBountyActions = () => {
  const workspaceId = useStringQuery("workspace");
  const router = useRouter();
  const [documentsState, { createDocument, publish }] =
    useDocuments(workspaceId);
  const { entries, saveEntry } = useBountyEntries(workspaceId);
  const [busy, setBusy] = useState<string | null>(null);

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
        saveEntry(bounty.slug, doc.id);
        router.push(`/workspace/${workspaceId}/documents/${doc.id}`);
      } catch (err) {
        console.error(err);
        setBusy(null);
      }
    },
    [documentsState.loading, createDocument, saveEntry, router, workspaceId]
  );

  const onSubmit = useCallback(
    async (bounty: BountyRef, documentId: string) => {
      setBusy(bounty.slug);
      try {
        await publish(documentId, {
          description: `Entry for the bounty "${bounty.title}".`,
          tags: ["bounty", bountyTag(bounty.slug)],
        });
        toast.success("Entry submitted. Your notebook is now public.");
      } catch (err) {
        console.error(err);
        toast.error("Could not submit the entry. Please try again.");
      } finally {
        setBusy(null);
      }
    },
    [publish]
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

    const submitted =
      !!entry.publishedAt && entry.tags?.includes(bountyTag(bounty.slug));

    return (
      <>
        <Button
          asChild
          size="sm"
          variant="secondary"
          className={bountyButtonClass}
        >
          <Link href={`/workspace/${workspaceId}/documents/${entry.id}`}>
            {submitted ? "Edit entry" : "Continue entry"}
          </Link>
        </Button>
        {submitted ? (
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
              onClick={() => onSubmit(bounty, entry.id)}
            >
              Publish and submit
            </Button>
          )
        )}
      </>
    );
  };
};

// =====================================
// ⬢ Workspace Bounties
// =====================================
export const WorkspaceBounties = () => {
  const workspaceId = useStringQuery("workspace");
  const renderActions = useWorkspaceBountyActions();

  return (
    <BountiesBoard
      renderActions={renderActions}
      detailHref={slug => `/workspace/${workspaceId}/bounties/${slug}`}
    />
  );
};
