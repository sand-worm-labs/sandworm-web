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
      className="flex flex-wrap gap-0.5 self-start rounded-[10px] bg-hover-bg p-[3px]"
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
              "h-7 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors",
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
