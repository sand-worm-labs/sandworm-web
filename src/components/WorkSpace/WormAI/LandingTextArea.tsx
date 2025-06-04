"use client";

import clsx from "clsx";
import { ArrowUpRightIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { ExamplePrompts } from "./ExamplePrompt";

export const LandingTextarea = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { push } = useRouter();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleCreateSearch = useCallback((prompt: string) => {
    push(`/search?q=${prompt}`);
  }, []);

  const handleSubmit = useCallback(
    (e: any) => {
      try {
        e?.preventDefault();

        setIsLoading(true);
        handleCreateSearch(input);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    },
    [input]
  );

  const handlePromptSelect = useCallback((prompt: string) => {
    handleCreateSearch(prompt);
  }, []);

  return (
    <div className="flex flex-col w-full gap-4 px-4">
      <span
        data-slot="control"
        className={clsx([
          "relative block w-full",
          "dark:before:hidden",
          "before:has-[[data-disabled]]:bg-zinc-950/5 before:has-[[data-disabled]]:shadow-none",
        ])}
      >
        <div
          className={clsx([
            "relative block size-full appearance-none overflow-hidden rounded-lg",
            "text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white dark:placeholder:text-zinc-400",
            "bg-white dark:bg-zinc-950",
            "focus:outline-none",
            "data-[invalid]:border-red-500 data-[invalid]:data-[hover]:border-red-500 data-[invalid]:dark:border-red-600 data-[invalid]:data-[hover]:dark:border-red-600",
            "disabled:border-zinc-950/20 disabled:dark:border-white/15 disabled:dark:bg-white/[2.5%] dark:data-[hover]:disabled:border-white/15",
            "ring-offset-background",
            "focus-within:ring focus-within:ring-blue-400 dark:focus-within:ring-blue-500",
            "border border-zinc-950/10 dark:border-white/10",
          ])}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit(e);
            }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative min-h-[36px] w-full">
              <textarea
                aria-label="Prompt"
                value={input}
                onChange={handleInputChange}
                placeholder="Do anything with WormAi..."
                className={clsx([
                  "size-full bg-transparent",
                  "relative block size-full appearance-none",
                  "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
                  "resize-none",
                  "focus:outline-none",
                  "scrollbar scrollbar-thumb-zinc-700 scrollbar-thumb-rounded-full scrollbar-w-[4px]",
                  "text-base/6 sm:text-sm/6",
                  "border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:ring-orange-500",
                  "p-0 px-4 pt-3",
                  "field-sizing-content resize-none",
                  "scrollbar-thin scrollbar-thumb-rounded-md",
                  "max-h-[48vh]",
                ])}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <div className="flex w-full items-center justify-between px-2 pb-2.5">
              <div />
              <Button
                type="submit"
                color={(input ? "blue" : "dark") as "blue" | "dark"}
                disabled={!input || isLoading}
                aria-label="Submit"
                className="p-2.5"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowUpRightIcon className=" text-white" size={40} />
                )}
              </Button>
            </div>
          </form>
        </div>
      </span>

      <ExamplePrompts onPromptSelect={handlePromptSelect} />
    </div>
  );
};
