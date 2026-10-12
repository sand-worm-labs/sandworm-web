import { protocolLogoUrl } from "@/lib/protocolLogos";
import { cn } from "@/lib/utils";

// A protocol's logo over its initial: if the logo does not load, the initial shows.
export function ProtocolLogo({
  name,
  version,
  className,
}: {
  name: string;
  // Changes when the logo is replaced, so a cached copy is not shown. Left out on the
  // public pages, where an hour of caching is fine.
  version?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden font-semibold",
        className
      )}
    >
      {name.charAt(0).toUpperCase()}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          version
            ? `${protocolLogoUrl(name)}?v=${version}`
            : protocolLogoUrl(name)
        }
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover text-transparent"
      />
    </span>
  );
}
