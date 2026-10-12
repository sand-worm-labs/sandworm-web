import type { IconType } from "react-icons";
import {
  PiDiscordLogo,
  PiGithubLogo,
  PiGlobe,
  PiTelegramLogo,
  PiXLogo,
} from "react-icons/pi";

import { cn } from "@/lib/utils";
import type { ProtocolLinkKey, ProtocolLinks as Links } from "@/types";

// In the order they are shown, with what each is called.
const LINKS: { key: ProtocolLinkKey; label: string; Icon: IconType }[] = [
  { key: "website", label: "Website", Icon: PiGlobe },
  { key: "twitter", label: "X", Icon: PiXLogo },
  { key: "github", label: "GitHub", Icon: PiGithubLogo },
  { key: "discord", label: "Discord", Icon: PiDiscordLogo },
  { key: "telegram", label: "Telegram", Icon: PiTelegramLogo },
];

// The profile page's social icons: a bordered, rounded tile around a 16px icon. `hero` is the
// same on the dark hero, where the colors are white at a lower strength.
const TILE = {
  page: "border-border dark:border-border-tertiary bg-inputBg dark:bg-transparent text-ink-300 dark:text-ink-400 hover:bg-hover-bg hover:border-primary dark:hover:bg-base-700",
  hero: "border-white/25 text-white/70 hover:bg-white/10 hover:text-white",
};

// =====================================
// ⬢  ProtocolLinks
// =====================================
// A protocol's links as icons, to sit under its description. Nothing is drawn for a protocol
// with none.
export function ProtocolLinks({
  name,
  links,
  tone = "hero",
  className,
}: {
  name: string;
  links: Links | undefined;
  tone?: keyof typeof TILE;
  className?: string;
}) {
  const shown = LINKS.filter(({ key }) => links?.[key]);
  if (shown.length === 0) return null;

  return (
    <ul
      aria-label={`${name} links`}
      className={cn("flex flex-wrap gap-3", className)}
    >
      {shown.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={links?.[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              key === "website" ? `${name} website` : `${name} on ${label}`
            }
            title={label}
            className={cn(
              "block rounded-xl border p-2.5 transition-colors",
              TILE[tone]
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}
