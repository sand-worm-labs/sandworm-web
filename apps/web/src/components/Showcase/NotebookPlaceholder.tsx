import { boardClass } from "@/components/Showcase/BoardKit";
import { tintPillDarkClassName } from "@/styles/interactive";

// Faint trend lines, one per card, so the cards do not look alike.
const SPARKLINES = [
  "0,28 14,24 28,26 42,18 56,20 70,12 84,15 98,8 120,5",
  "0,10 14,14 28,12 42,20 56,17 70,24 84,21 98,27 120,24",
  "0,24 14,24 28,17 42,17 56,22 70,10 84,10 98,14 120,6",
];

export type PlaceholderCard = { label: string; detail: string };

// =====================================
// ⬢  NotebookPlaceholder
// =====================================
// What a Showcase page shows in place of a notebook that has no cells yet: what is
// coming, and the shape of it. It stands where the notebook would, so the hero above and
// the calls to action below stay as they are.
export function NotebookPlaceholder({
  status,
  title,
  description,
  cards,
}: {
  status: string;
  title: string;
  description: string;
  cards: PlaceholderCard[];
}) {
  return (
    <section className="container mx-auto px-4 sm:px-8 py-10">
      <div className={`${boardClass} p-6 sm:p-8`}>
        <span
          className={`inline-flex items-center gap-2 rounded-md border border-transparent bg-base-600 px-2.5 py-1 text-xs text-ink-400 ${tintPillDarkClassName}`}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-primary-tint-75"
          />
          {status}
        </span>

        <h2 className="mt-4 text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-ink-100 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-400">
          {description}
        </p>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {cards.map((card, index) => (
            <li
              key={card.label}
              className="flex flex-col rounded-xl border border-border-secondary dark:border-border-tertiary bg-base-100 dark:bg-header-surface p-4"
            >
              <span className="text-sm font-medium text-ink-100 dark:text-white">
                {card.label}
              </span>
              <span className="mt-1.5 text-[13px] leading-5 text-ink-400">
                {card.detail}
              </span>
              <svg
                viewBox="0 0 120 32"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="mt-auto block h-10 w-full pt-4 box-content text-primary dark:text-primary-tint-75"
              >
                <line
                  x1="0"
                  y1="31"
                  x2="120"
                  y2="31"
                  className="stroke-border-secondary dark:stroke-border-tertiary"
                  strokeWidth="1"
                />
                <polyline
                  points={SPARKLINES[index % SPARKLINES.length]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity="0.75"
                />
              </svg>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-xs text-ink-300">
          Sample page. It shows how this page will look once the analysis is
          published.
        </p>
      </div>
    </section>
  );
}
