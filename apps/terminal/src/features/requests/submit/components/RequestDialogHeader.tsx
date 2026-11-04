import { PiX } from "react-icons/pi";
import { DialogClose } from "@sandworm/ui/components/dialog";

export function CommissionTabs() {
  return (
    <div className="flex items-center justify-between gap-3 px-6 pt-[18px]">
      <span className="text-base font-medium text-ink-100">
        Commission research
      </span>
      <DialogClose
        aria-label="Close"
        className="flex size-[30px] items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-hover-bg"
      >
        <PiX size={14} aria-hidden="true" />
      </DialogClose>
    </div>
  );
}
