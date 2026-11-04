type OptionCardProps = {
  name: string;
  value: string;
  checked: boolean;
  title: string;
  description: string;
  onSelect: () => void;
};

export function OptionCard({
  name,
  value,
  checked,
  title,
  description,
  onSelect,
}: OptionCardProps) {
  return (
    <label className="group flex min-h-[72px] cursor-pointer flex-col gap-1 rounded-[14px] border border-hover-border bg-block-surface px-4 py-3.5 has-[:checked]:border-primary has-[:checked]:bg-primary-tint-50 dark:has-[:checked]:bg-primary-910 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-primary-tint-100">
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
      />
      <span className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink-100">{title}</span>
        <span
          aria-hidden="true"
          className="size-4 shrink-0 rounded-full border-[1.5px] border-ink-600 bg-block-surface group-has-[:checked]:border-[5px] group-has-[:checked]:border-primary"
        />
      </span>
      <span className="text-xs text-ink-400">{description}</span>
    </label>
  );
}
