interface NotebookTitleProps {
  title: string | null;
  isLoading: boolean;
}

export default function NotebookTitle({
  title,
  isLoading,
}: NotebookTitleProps) {
  if (isLoading) {
    return (
      <div className="h-5 w-48 max-w-full rounded bg-base-200 dark:bg-base-600 animate-pulse" />
    );
  }

  return (
    <span
      title={title || "Untitled"}
      className="block truncate text-[14px] sm:text-base font-medium text-ink-100 dark:text-white"
    >
      {title || "Untitled"}
    </span>
  );
}
