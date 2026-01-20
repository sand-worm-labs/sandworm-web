import clsx from "clsx";

const examplePrompts = [
  { id: "eliza", prompt: "How many farcaster handles have a premium badge?" },
  {
    id: "agent",
    prompt: "Top 10 DeFi protocols on Ethereum ranked by total value",
  },
  {
    id: "create-agent",
    prompt:
      "average gas fee on Linea compared to Ethereum in the last 24 hours?",
  },
  {
    id: "analytics",
    prompt: "What’s the Daily active wallets (7d) on Base?",
  },
  {
    id: "transaction",
    prompt:
      "Compare the transaction volume of Uniswap to Aerodrome (30d) on Base",
  },
];

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

export function ExamplePrompts({ onPromptSelect }: ExamplePromptsProps) {
  return (
    <div className="w-full max-w-[800px] flex flex-wrap items-center justify-center gap-2 md:gap-4 font-body">
      {examplePrompts.map(({ id, prompt }) => (
        <button
          type="button"
          key={id}
          className={clsx([
            "!shrink-0 !rounded-full !px-3 !py-1 !text-xs !flex !items-center !gap-2 hover:cursor-pointer dark:text-ink-300  text-ink-400",
            // Base
            "relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-sm font-base",
            // Focus
            "focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-[#A308F0]",
            // Disabled
            "disabled:opacity-50 disabled:pointer-events-none",
            // Icon
            "*[data-slot=icon]:-mx-0.5 *[data-slot=icon]:my-0.5 *[data-slot=icon]:size-5 *[data-slot=icon]:shrink-0 *[data-slot=icon]:text-(--btn-icon) sm:*[data-slot=icon]:my-1 sm:*[data-slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText]",
            // Base
            "border-[#E9ECEF] dark:text-ink-300  hover:bg-zinc-950/[2.5%] text-ink-400 active:bg-zinc-950/[2.5%]",
            // Dark mode
            "dark:border-white/15  dark:text-ink-300   dark:[--btn-bg:transparent] dark:hover:bg-white/5 dark:active:bg-white/5",
            // Icon
            "[--btn-icon:var(--color-zinc-500)] hover:[--btn-icon:var(--color-zinc-700)] active:[--btn-icon:var(--color-zinc-700)] dark:active:[--btn-icon:var(--color-zinc-400)] dark:hover:[--btn-icon:var(--color-zinc-400)]",
          ])}
          onClick={() => onPromptSelect(prompt)}
        >
          {prompt
            ?.split("\n")[0]
            ?.replace("Create ", "")
            ?.replace("Design ", "") ?? ""}
        </button>
      ))}
    </div>
  );
}
