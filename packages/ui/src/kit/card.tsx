import clsx from "clsx";
import type { ComponentProps } from "react";

const toneClassNames = {
  raised: "border border-hover-border bg-block-surface block-shadow-soft",
  muted: "bg-inputBg",
} as const;

// A line between the rows of a list inside a card, none above the first.
export const cardRowDividerClassName =
  "border-t border-border-secondary first:border-t-0";

type CardProps = ComponentProps<"section"> & {
  tone?: keyof typeof toneClassNames;
  // Edge to edge on a phone, as a list in an app is: it takes back the page's side padding
  bleed?: boolean;
};

export function Card({
  tone = "raised",
  bleed,
  className,
  ...props
}: CardProps) {
  return (
    <section
      className={clsx(
        toneClassNames[tone],
        bleed
          ? "-mx-4 rounded-none border-x-0 md:mx-0 md:rounded-[22px] md:border-x"
          : "rounded-[22px]",
        className
      )}
      {...props}
    />
  );
}
