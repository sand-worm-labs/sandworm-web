"use client";

import Link from "next/link";
import { PiArrowLeft } from "react-icons/pi";

import { useGetBountyQuery } from "@/generated/graphql";

import type { BountyRef } from "./bounties";
import { BountyBrief } from "./BountyBrief";
import { BountyHeader } from "./BountyHeader";
import { BountySidebar } from "./BountySidebar";

interface BountyDetailProps {
  slug: string;
  backHref: string;
  renderActions: (bounty: BountyRef) => React.ReactNode;
}

export const BountyDetail = ({
  slug,
  backHref,
  renderActions,
}: BountyDetailProps) => {
  const { data, loading, error, refetch } = useGetBountyQuery({
    variables: { slug },
    skip: !slug,
  });
  const bounty = data?.getBounty;

  const back = (
    <Link
      href={backHref}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-ink-100 dark:hover:text-white"
    >
      <PiArrowLeft size={14} /> All bounties
    </Link>
  );

  if (!bounty) {
    return (
      <div className="container mx-auto font-body pt-4">
        {back}
        <p className="mt-6 text-sm text-ink-400">
          {loading && "Loading the bounty..."}
          {error && "Could not load the bounty. Please try again."}
          {!loading && !error && "This bounty does not exist."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto font-body pt-4 pb-12">
      {back}

      {/* One grid: the sidebar sits beside the header on desktop and between
          the header and the brief on mobile. */}
      <div className="mt-5 grid items-start gap-x-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <header className="order-1 max-w-3xl lg:order-none lg:col-start-1 lg:row-start-1">
          <BountyHeader bounty={bounty} />
        </header>

        <BountySidebar
          bounty={bounty}
          actions={renderActions(bounty)}
          onChanged={() => refetch()}
          className="order-2 mt-8 lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:sticky lg:top-6"
        />

        <div className="order-3 min-w-0 max-w-3xl lg:order-none lg:col-start-1 lg:row-start-2">
          <BountyBrief bounty={bounty} />
        </div>
      </div>
    </div>
  );
};
