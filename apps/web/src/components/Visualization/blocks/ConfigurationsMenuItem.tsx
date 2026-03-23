import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ConfigurationsMenuBlinkingSignal } from "./BlinkingSignal";

type BaseConfigurationsMenuProps = {
  icon: React.ElementType;
  text: string;
  blink?: boolean;
};

type ConfigurationsMenuLinkProps = BaseConfigurationsMenuProps & {
  href: string;
  openInNewTab: boolean;
};

type ConfigurationsMenuButtonProps = BaseConfigurationsMenuProps & {
  onClick: () => void;
};

const ConfigurationsMenuLink = ({
  href,
  openInNewTab,
  text,
  icon: Icon,
  blink,
}: ConfigurationsMenuLinkProps) => {
  const pathname = usePathname();

  const isActive = pathname?.startsWith(href);

  return (
    <Link
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      className={clsx(
        isActive
          ? "text-gray-800 bg-ceramic-100/50"
          : "text-ink-400  hover:bg-ceramic-100/80",
        "group text-sm font-medium leading-6 w-full flex py-1 hover:text-ceramic-600"
      )}
    >
      <div className="w-full flex items-center gap-x-2 px-4 relative">
        {blink && <ConfigurationsMenuBlinkingSignal />}
        <Icon strokeWidth={1} className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="mt-0.5">{text}</span>
      </div>
    </Link>
  );
};

const ConfigurationsMenuButton = ({
  onClick: handleClick,
  icon: Icon,
  text,
  blink,
}: ConfigurationsMenuButtonProps) => {
  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "group text-sm font-medium leading-6 w-full flex py-1 hover:text-ceramic-600",
        "text-ink-400  hover:bg-ceramic-100/80"
      )}
    >
      <div className="w-full flex items-center gap-x-2 px-4 relative">
        {blink && <ConfigurationsMenuBlinkingSignal />}
        <Icon strokeWidth={1} className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="mt-0.5">{text}</span>
      </div>
    </button>
  );
};

export { ConfigurationsMenuLink, ConfigurationsMenuButton };
