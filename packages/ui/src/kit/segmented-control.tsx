import clsx from "clsx";

type SegmentOption<Id extends string> = {
  id: Id;
  label: string;
  count?: number;
};

type SegmentedControlProps<Id extends string> = {
  label: string;
  options: readonly SegmentOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
};

export function SegmentedControl<Id extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<Id>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex max-w-full gap-0.5 self-start overflow-x-auto rounded-[10px] bg-hover-bg p-[3px] [scrollbar-width:none] md:flex-wrap [&::-webkit-scrollbar]:hidden"
    >
      {options.map(option => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            className={clsx(
              "h-8 shrink-0 whitespace-nowrap rounded-lg px-3 md:h-7 md:px-2.5 text-xs font-medium transition-colors",
              isSelected
                ? "bg-block-surface text-ink-100 shadow-sm"
                : "text-ink-400 hover:text-ink-100"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1 font-normal text-ink-400">
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
