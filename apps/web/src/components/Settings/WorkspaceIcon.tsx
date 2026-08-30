import Image from "next/image";
import clsx from "clsx";
import { PiBuildings } from "react-icons/pi";

interface WorkspaceIconProps {
  icon?: string | null;
  size?: number;
  className?: string;
}

// =====================================
// ⬢ Workspace Icon
// A missing icon still needs to occupy the same footprint as a real one —
// callers (e.g. the account settings workspace list) size their skeleton
// rows against this component's box, so returning null here collapses the
// row and causes a layout jump once real data replaces the skeleton.
// =====================================
export function WorkspaceIcon({
  icon,
  size = 32,
  className,
}: WorkspaceIconProps) {
  if (!icon) {
    return (
      <div
        className={clsx(
          "flex shrink-0 items-center justify-center bg-base-300 text-ink-400 dark:bg-base-700",
          className
        )}
        style={{ width: size, height: size }}
      >
        <PiBuildings size={Math.round(size * 0.55)} />
      </div>
    );
  }

  const src = `/img/${icon.replace(/\.[^.]+$/, "")}.png`;
  return (
    <Image
      src={src}
      alt={icon}
      width={size}
      height={size}
      className={className}
    />
  );
}
