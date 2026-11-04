import Image from "next/image";

export function BrandMark() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.svg" alt="" width={30} height={30} />
      <span className="font-tertiary text-[1.05rem] font-bold uppercase leading-normal text-ink-100">
        SandWorm
      </span>
    </span>
  );
}
