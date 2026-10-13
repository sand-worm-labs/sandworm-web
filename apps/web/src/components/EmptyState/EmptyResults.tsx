import type { IconType } from "react-icons";

interface EmptyResultsProps {
  icon: IconType;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export const EmptyResults = ({
  icon: Icon,
  title,
  hint,
  action,
}: EmptyResultsProps) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <Icon size={36} className="text-ink-200 dark:text-ink-600" />
    <p className="text-sm font-medium text-ink-200 dark:text-ink-400">
      {title}
    </p>
    {hint && <p className="text-xs text-ink-300 dark:text-ink-500">{hint}</p>}
    {action}
  </div>
);
