import { PiX } from "react-icons/pi";
import { DialogClose } from "@sandworm/ui/components/dialog";

export function ModalClose() {
  return (
    <DialogClose
      aria-label="Close"
      className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-hover-bg"
    >
      <PiX size={14} aria-hidden="true" />
    </DialogClose>
  );
}
