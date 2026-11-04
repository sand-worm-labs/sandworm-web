import clsx from "clsx";

type CheckboxProps = {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
};

export function Checkbox({
  id,
  checked,
  onCheckedChange,
  className,
}: CheckboxProps) {
  return (
    <span
      className={clsx(
        "relative inline-flex size-4 shrink-0 items-center justify-center",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={event => onCheckedChange(event.target.checked)}
        className="peer absolute inset-0 size-4 cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        className={clsx(
          "flex size-4 items-center justify-center rounded-[4px] border bg-block-surface transition-colors",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-violet",
          checked
            ? "border-accent-violet"
            : "border-border-faint dark:border-border-tertiary"
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="h-3.5 w-3.5 text-accent-violet"
          >
            <path
              d="M2.5 6.2L4.8 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </span>
  );
}
