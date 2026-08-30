import clsx from "clsx";

// =====================================
// ⬢ Constants
// =====================================
export const examplePrompts = [
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
  disabled?: boolean;
}

// =====================================
// ⬢ Example Prompts
// =====================================
export function ExamplePrompts({
  onPromptSelect,
  disabled = false,
}: ExamplePromptsProps) {
  return (
    <div className="w-full max-w-[800px] flex flex-wrap items-center justify-center gap-2 md:gap-4 font-body">
      {examplePrompts.map(({ id, prompt }) => (
        <button
          type="button"
          key={id}
          disabled={disabled}
          className={clsx([
            "!shrink-0 !rounded-full !px-3 !py-1 !text-xs !flex !items-center !gap-2 hover:cursor-pointer text-ink-400",
            "relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-sm font-base",
            "focus:outline-none focus:outline-2 focus:outline-offset-2 focus:outline-primary",
            "disabled:opacity-50 disabled:pointer-events-none",
            "*[data-slot=icon]:-mx-0.5 *[data-slot=icon]:my-0.5 *[data-slot=icon]:size-5 *[data-slot=icon]:shrink-0 *[data-slot=icon]:text-(--btn-icon) sm:*[data-slot=icon]:my-1 sm:*[data-slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText]",
            "border-border-secondary hover:bg-hover-bg hover:border-primary text-ink-400 active:bg-hover-bg",
            "dark:border-border-cool dark:bg-[#212529] dark:hover:bg-white/5 dark:active:bg-white/5",
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
