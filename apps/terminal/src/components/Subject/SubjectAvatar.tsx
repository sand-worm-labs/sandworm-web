"use client";

import clsx from "clsx";
import type { IconType } from "react-icons";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnalysisViewKind, type SubjectIcon } from "@sandworm/types/terminal";

import { logoUrl } from "@/lib/logo-url";

import {
  DEFAULT_SECTOR_SYMBOL,
  REGION_SYMBOL,
  SECTOR_SYMBOLS,
} from "./symbols";

// One rounded square for everything a subject can show, so a table of projects,
// regions and sectors reads as one list. Logos come in every shape, and a square
// with some room round them keeps them whole where a circle would crop them.
const SIZES = {
  sm: { tile: "size-7 rounded-lg text-[11px]", glyph: 14 },
  md: { tile: "size-9 rounded-[10px] text-xs", glyph: 18 },
  lg: { tile: "size-[52px] rounded-[14px] text-[22px]", glyph: 26 },
};

const TINT =
  "bg-primary-tint-75 text-primary-700 dark:bg-primary-910 dark:text-primary-200";

// The flag set is one 330 KB module, so it is fetched when a flag is first shown
export const FlagIcon = lazy(() =>
  import("country-flag-icons/react/1x1").then(flags => ({
    default: ({ code }: { code: string }) => {
      const Flag = flags[code as keyof typeof flags];
      return Flag ? <Flag className="size-full" /> : null;
    },
  }))
);

type SubjectAvatarProps = {
  name: string;
  icon: SubjectIcon | null;
  size?: keyof typeof SIZES;
  // What kind of subject it is, for what it shows when it has no icon: a project
  // its initial, a region a globe, a sector a symbol
  view?: AnalysisViewKind;
};

export function SubjectAvatar({
  name,
  icon,
  size = "md",
  view = AnalysisViewKind.PROJECT,
}: SubjectAvatarProps) {
  const { tile, glyph } = SIZES[size];
  const base = clsx(
    "relative flex shrink-0 items-center justify-center overflow-hidden font-medium ring-1 ring-inset ring-border-secondary",
    tile
  );

  if (icon?.kind === "flag") {
    return (
      <span aria-hidden="true" className={base}>
        <Suspense>
          <FlagIcon code={icon.code} />
        </Suspense>
      </span>
    );
  }

  const symbol: IconType | undefined =
    icon?.kind === "symbol"
      ? (SECTOR_SYMBOLS[icon.key] ?? DEFAULT_SECTOR_SYMBOL)
      : {
          [AnalysisViewKind.PROJECT]: undefined,
          [AnalysisViewKind.REGION]: REGION_SYMBOL,
          [AnalysisViewKind.SECTOR]: DEFAULT_SECTOR_SYMBOL,
        }[view];
  const Symbol = symbol;
  const initial = Symbol ? (
    <Symbol size={glyph} aria-hidden="true" />
  ) : (
    name.charAt(0)
  );

  if (icon?.kind === "logo") {
    return <LogoTile slug={icon.slug} className={base} initial={initial} />;
  }
  return (
    <span aria-hidden="true" className={clsx(base, TINT)}>
      {initial}
    </span>
  );
}

// The initial sits under the logo and shows until it has loaded, and for good if
// there is none: no empty tile, and nothing jumps when it arrives.
function LogoTile({
  slug,
  className,
  initial,
}: {
  slug: string;
  className: string;
  initial: React.ReactNode;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // An image that finished before this ran never fires onLoad
  useEffect(() => {
    if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  return (
    <span aria-hidden="true" className={clsx(className, TINT)}>
      {initial}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={logoUrl(slug)}
        alt=""
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={clsx(
          "absolute inset-0 size-full bg-white object-contain p-[12%] transition-opacity",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </span>
  );
}
