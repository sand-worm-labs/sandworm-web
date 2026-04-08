import Image from "next/image";

interface WorkspaceIconProps {
  icon?: string | null;
  size?: number;
  className?: string;
}

// =====================================
// ⬢ Workspace Icon
// =====================================
export function WorkspaceIcon({
  icon,
  size = 32,
  className,
}: WorkspaceIconProps) {
  if (!icon) return null;
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
