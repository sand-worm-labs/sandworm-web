"use client";

import clsx from "clsx";
import { ArrowUpRightIcon } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";

import { ExamplePrompts } from "./ExamplePrompt";

export const LandingTextarea = () => {
  const [input, setInput] = useState("");

  const IS_DISABLED = true;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  return (
    <div className="flex flex-col w-full gap-4 px-4">
      <span data-slot="control" className={clsx("relative block w-full")}>
        <div
          className={clsx([
            "relative block size-full overflow-hidden rounded-lg",
            "bg-white dark:bg-zinc-950",
            "border border-zinc-950/10 dark:border-white/10",
            "focus-within:ring focus-within:ring-blue-400 dark:focus-within:ring-blue-500",
          ])}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative min-h-[36px] w-full">
              <textarea
                disabled={IS_DISABLED}
                aria-label="Prompt"
                value={input}
                onChange={handleInputChange}
                placeholder="Do anything with WormAi..."
                className={clsx([
                  "size-full bg-transparent px-4 pt-3",
                  "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                  "resize-none border-none outline-none scrollbar-thin",
                  "scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-md",
                  "text-base sm:text-sm max-h-[48vh]",
                  IS_DISABLED && "opacity-60 cursor-not-allowed",
                ])}
              />
            </div>

            {IS_DISABLED && (
              <div className="text-sm text-zinc-400 dark:text-zinc-400 px-4 pt-2 text-left ">
                WormAi is currently in early development. Prompting is disabled
                for now, but we’re shipping features rapidly — expect
                functionality to start rolling out in the next update.
              </div>
            )}

            <div className="flex w-full items-center justify-between px-2 pb-2.5">
              <div />
              <Button
                type="submit"
                disabled
                aria-label="Submit"
                className="p-2.5 opacity-50 cursor-not-allowed"
              >
                <ArrowUpRightIcon className="text-white" size={40} />
              </Button>
            </div>
          </form>
        </div>
      </span>

      <ExamplePrompts onPromptSelect={() => {}} />
    </div>
  );
};
