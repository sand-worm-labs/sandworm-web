import { RichTextView } from "@/components/RichTextField";

import type { BountyDetails } from "./bounties";
import { BountyEntries } from "./BountyEntries";
import { BountyWinners } from "./BountyParts";

const bodyTextClass =
  "text-[0.85rem] leading-relaxed text-ink-400 dark:text-gray-300";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mt-8">
    <h2 className="mb-2 text-sm font-bold text-ink-100 dark:text-white">
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
      className={`space-y-1.5 pl-5 ${bodyTextClass} ${
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

export const BountyBrief = ({ bounty }: { bounty: BountyDetails }) => (
  <>
    {bounty.details && (
      <section className="mt-8">
        <RichTextView markdown={bounty.details} />
      </section>
    )}

    {bounty.background && (
      <Section title="Background">
        <p className={`${bodyTextClass} break-words`}>{bounty.background}</p>
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
  </>
);
