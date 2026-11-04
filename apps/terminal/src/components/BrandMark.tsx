import Image from "next/image";

// Matches the web app's header logo (PublicHeaderLogo).
export function BrandMark() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="" width={26} height={26} />
      <span className="hidden font-tertiary text-[0.95rem] font-bold uppercase text-ink-100 sm:inline dark:text-white">
        SandWorm
      </span>
    </span>
  );
}
