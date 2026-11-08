import clsx from "clsx";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type ErrorScreenProps = {
  // The big mark above the title: "404", "?"
  heading: string;
  title: string;
  subtitle: string;
  image: StaticImageData;
  // Buttons, such as Try again
  actions?: ReactNode;
  links?: readonly { label: string; href: string }[];
  // What to quote to support
  reference?: string;
  // On its own page (no header), or inside the app's
  isFullPage?: boolean;
};

export const errorLinkClassName =
  "font-body text-sm font-medium text-primary-700 hover:underline dark:text-primary";

// The page the terminal shows when something is missing or has gone wrong:
// the same layout as the main app's error and 404 pages.
export function ErrorScreen({
  heading,
  title,
  subtitle,
  image,
  actions,
  links = [],
  reference,
  isFullPage = false,
}: ErrorScreenProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-2 px-4 pb-8 pt-[6vh] text-center font-body",
        isFullPage && "min-h-screen bg-page-surface text-ink-100"
      )}
    >
      <h1 className="font-mono text-[6rem] leading-[1.2] text-ink-100">
        {heading}
      </h1>
      <div className="text-[26px] font-medium text-ink-100">{title}</div>
      <p className="mt-2 max-w-[28rem] text-base text-ink-500 dark:text-ink-400">
        {subtitle}
      </p>
      <div className="mt-6 flex flex-row flex-wrap items-center justify-center gap-5">
        {actions}
        {links.map(link => (
          <Link key={link.href} href={link.href} className={errorLinkClassName}>
            {link.label}
          </Link>
        ))}
      </div>
      {reference && (
        <p className="mt-4 font-mono text-xs text-ink-400">
          Reference {reference}
        </p>
      )}
      <Image
        src={image}
        alt=""
        priority
        className="mt-10 h-auto w-full max-w-[640px]"
      />
    </div>
  );
}
