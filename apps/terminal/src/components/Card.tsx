import clsx from "clsx";
import type { ComponentProps } from "react";

const toneClassNames = {
  raised: "border border-hover-border bg-block-surface block-shadow-soft",
  muted: "bg-inputBg",
} as const;

type CardProps = ComponentProps<"section"> & {
  tone?: keyof typeof toneClassNames;
};

export function Card({ tone = "raised", className, ...props }: CardProps) {
  return (
    <section
      className={clsx("rounded-[22px]", toneClassNames[tone], className)}
      {...props}
    />
  );
}
