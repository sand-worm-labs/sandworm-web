import clsx from "clsx";

type AllowancePipsProps = {
  used: number;
  total: number;
  note: string;
};

export function AllowancePips({ used, total, note }: AllowancePipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-inputBg px-3.5 py-3 ring-1 ring-inset ring-border-secondary">
      <span aria-hidden="true" className="flex gap-[3px]">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={clsx(
              "h-1.5 w-[18px] rounded-[3px]",
              index < used ? "bg-primary" : "bg-border-secondary"
            )}
          />
        ))}
      </span>
      <span className="font-medium text-ink-100">
        {used} of {total} used this quarter
      </span>
      <span className="text-ink-400">{note}</span>
    </div>
  );
}
