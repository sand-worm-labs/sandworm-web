"use client";

import { Button } from "@/components/Button";

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[22px] border border-hover-border bg-block-surface p-6"
    >
      <h1 className="text-base font-medium text-ink-100">
        We couldn&apos;t load this page
      </h1>
      <p className="text-ink-400">
        Your numbers are safe. Try again, and if it keeps happening, contact
        support.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
