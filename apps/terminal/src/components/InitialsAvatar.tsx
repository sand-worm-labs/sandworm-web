import clsx from "clsx";

const toneClassNames = {
  brand:
    "bg-primary-tint-75 dark:bg-primary-910 text-primary-700 dark:text-primary-200",
  navy: "bg-ink-navy text-white",
} as const;

const sizeClassNames = {
  sm: "size-7 text-[11px]",
  md: "size-9 text-xs",
} as const;

type InitialsAvatarProps = {
  initials: string;
  tone?: keyof typeof toneClassNames;
  size?: keyof typeof sizeClassNames;
};

export function InitialsAvatar({
  initials,
  tone = "brand",
  size = "md",
}: InitialsAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "flex shrink-0 items-center justify-center rounded-full font-medium",
        toneClassNames[tone],
        sizeClassNames[size]
      )}
    >
      {initials}
    </span>
  );
}
