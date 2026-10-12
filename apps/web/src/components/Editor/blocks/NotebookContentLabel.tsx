import { PiShieldWarning } from "react-icons/pi";

// Goes above output that a notebook's code drew, in a notebook the reader
// didn't write. That output sits inside the app and can look like part of it;
// this says it isn't, so a form asking for a password reads as the
// notebook's, not ours.
export function NotebookContentLabel() {
  return (
    <div
      className="flex items-center gap-x-1 px-1 pb-1 text-[10px] leading-none text-ink-400 select-none"
      title="This was drawn by the notebook's code. Sandworm never asks for your password or keys inside a notebook."
    >
      <PiShieldWarning className="h-3 w-3 shrink-0" />
      <span>From this notebook&apos;s code, not from Sandworm</span>
    </div>
  );
}
