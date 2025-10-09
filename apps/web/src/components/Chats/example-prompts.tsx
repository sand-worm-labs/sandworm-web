import clsx from "clsx";
import { ArrowUpRightIcon } from "lucide-react";

const examplePrompts = [
  { id: "eliza", prompt: "What's Vitalik's wallet holding rn?" },
  { id: "agent", prompt: "Most active token on Base today?" },
  { id: "create-agent", prompt: "How do I track airdrops to new wallets?" },
  {
    id: "analytics",
    prompt: "Show me top 10 NFT projects by volume this week.",
  },
];

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export function ExamplePrompts({ onPromptSelect }: ExamplePromptsProps) {
  return (
    <div className="w-full grid grid-cols-2 items-center justify-center gap-2 md:gap-4 ">
      {examplePrompts.map(({ id, prompt }) => (
        <button
          type="button"
          key={id}
          className={clsx([
            "!shrink-0 !rounded-full !px-3 !py-1 !text-xs !flex !items-center !gap-2 hover:cursor-pointer dark:text-white text-[#6C757D]",
            // Base
            "relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-base/6 font-base",
            // Focus
            "focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-orange-600",
            // Disabled
            "disabled:opacity-50 disabled:pointer-events-none",
            // Icon
            "*[data-slot=icon]:-mx-0.5 *[data-slot=icon]:my-0.5 *[data-slot=icon]:size-5 *[data-slot=icon]:shrink-0 *[data-slot=icon]:text-(--btn-icon) sm:*[data-slot=icon]:my-1 sm:*[data-slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText]",
            // Base
            "border-[#E9ECEF] dark:text-white hover:bg-zinc-950/[2.5%] text-black active:bg-zinc-950/[2.5%]",
            // Dark mode
            "dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:hover:bg-white/5 dark:active:bg-white/5",
            // Icon
            "[--btn-icon:var(--color-zinc-500)] hover:[--btn-icon:var(--color-zinc-700)] active:[--btn-icon:var(--color-zinc-700)] dark:active:[--btn-icon:var(--color-zinc-400)] dark:hover:[--btn-icon:var(--color-zinc-400)]",
          ])}
          onClick={() => onPromptSelect(prompt)}
        >
          {prompt.split("\n")[0].replace("Create ", "").replace("Design ", "")}
          <ArrowUpRightIcon className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
