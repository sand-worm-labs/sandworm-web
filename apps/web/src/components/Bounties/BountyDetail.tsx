"use client";

import Link from "next/link";
import { PiArrowLeft, PiTrophy } from "react-icons/pi";

import { RichTextView } from "@/components/RichTextField";
import { useGetBountyQuery } from "@/generated/graphql";
import { EscrowPanel } from "@/web3/components/EscrowPanel";
import { FaucetButton } from "@/web3/components/FaucetButton";

import type { BountyRef } from "./bounties";
import { BountyChips, BountyReward, BountyWinners } from "./BountyCard";
import { BountyEntries } from "./BountyEntries";
import { SponsorLogo } from "./BountyLogos";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mt-8">
    <h2 className="text-sm font-bold text-ink-100 dark:text-white mb-2">
      {title}
    </h2>
    {children}
  </section>
);

const List = ({
  items,
  numbered = false,
}: {
  items: string[];
  numbered?: boolean;
}) => {
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag
      className={`space-y-1.5 pl-5 text-[0.85rem] leading-relaxed text-ink-400 dark:text-gray-300 ${
        numbered ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map(item => (
        <li key={item} className="break-words">
          {item}
        </li>
      ))}
    </Tag>
  );
};

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

  const actions = renderActions(bounty);

  return (
    <div className="container mx-auto font-body pt-4 pb-12">
      {back}

      <div className="mt-5 grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <header className="order-1 lg:order-none lg:col-start-1 lg:row-start-1 max-w-3xl">
          <BountyChips bounty={bounty} />
          <h1 className="mt-3 text-2xl font-bold text-ink-100 dark:text-white">
            {bounty.title}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-400">
            <SponsorLogo sponsor={bounty.sponsor} size={18} />
            Sponsored by {bounty.sponsor}
            {bounty.postedOn && ` · Posted ${bounty.postedOn}`}
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-200 dark:text-gray-300">
            {bounty.summary}
          </p>
        </header>

        <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 min-w-0 max-w-3xl">
          {bounty.details && (
            <section className="mt-8">
              <RichTextView markdown={bounty.details} />
            </section>
          )}

          {bounty.background && (
            <Section title="Background">
              <p className="text-[0.85rem] leading-relaxed text-ink-400 dark:text-gray-300 break-words">
                {bounty.background}
              </p>
            </Section>
          )}

          {bounty.requirements.length > 0 && (
            <Section title="What to answer">
              <List items={bounty.requirements} numbered />
            </Section>
          )}

          {bounty.deliverables.length > 0 && (
            <Section title="What to submit">
              <List items={bounty.deliverables} />
            </Section>
          )}

          {bounty.judging.length > 0 && (
            <Section title="How it is judged">
              <List items={bounty.judging} />
            </Section>
          )}

          {bounty.winners.length > 0 && (
            <Section title="Winners">
              <BountyWinners winners={bounty.winners} />
            </Section>
          )}

          <BountyEntries slug={bounty.slug} />
        </div>

        <aside className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6 mt-8 lg:mt-0 rounded-3xl bg-base-100 border border-border-secondary dark:border-border-tertiary p-6">
          <p className="text-xs text-ink-400">
            {bounty.sample ? "Original reward" : "Reward"}
          </p>
          <BountyReward
            reward={bounty.reward}
            size={22}
            className="mt-1 text-lg font-bold"
          />

          {bounty.prizes.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-ink-400">
              {bounty.prizes.map(prize => (
                <li key={prize} className="flex gap-1.5">
                  <PiTrophy size={13} className="mt-0.5 shrink-0" />
                  <span>{prize}</span>
                </li>
              ))}
            </ul>
          )}

          <EscrowPanel bounty={bounty} onChanged={() => refetch()} />

          {!bounty.sample && <FaucetButton rewardToken={bounty.rewardToken} />}

          {actions && (
            <div className="mt-5 flex items-center gap-2 [&>a]:flex-1 [&>button]:flex-1 [&>a]:whitespace-nowrap [&>button]:whitespace-nowrap [&>a]:px-2 [&>button]:px-2">
              {actions}
            </div>
          )}

          <p className="mt-5 text-xs leading-relaxed text-ink-400">
            Starting a bounty creates a notebook for it in your workspace, but
            you are not tied to it. You can start with one notebook and submit
            another: pick any of yours when you submit, and it is published as
            your entry.
          </p>

          {bounty.sample && (
            <p className="mt-4 rounded-2xl bg-base-300 dark:bg-base-700 p-3 text-xs leading-relaxed text-ink-400">
              {bounty.sponsor} posted this bounty outside Sandworm
              {bounty.postedOn ? ` (${bounty.postedOn})` : ""}. It is listed as
              an example to practise on: Sandworm does not pay its reward.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};
