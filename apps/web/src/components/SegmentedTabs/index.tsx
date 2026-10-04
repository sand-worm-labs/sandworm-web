import clsx from "clsx";

export const segmentedTabsClass =
  "flex items-center shrink-0 whitespace-nowrap px-0.5 relative bg-base-600 py-0.5 rounded-md gap-x-1.5";

export const segmentedTabClass = (active: boolean) =>
  clsx(
    "border border-transparent flex gap-x-1.5 items-center w-fit shrink-0 whitespace-nowrap px-1.5 py-0.5 text-[0.8rem] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white dark:hover:bg-white/10 rounded font-medium hover:border-primary hover:border hover:text-primary",
    active
      ? "bg-white dark:bg-base-600 dark:text-[#9D8FF0] border border-primary text-primary outline outline-1 outline-primary outline-offset-1"
      : "bg-transparent text-ink-400 dark:bg-transparent dark:text-ink-400"
  );
