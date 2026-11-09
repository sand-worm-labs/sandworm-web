import { ModalClose } from "@/components/ModalClose";

export function RequestDialogHeader() {
  return (
    <div className="flex items-center justify-between gap-3 px-6 pt-[18px]">
      <span className="text-base font-medium text-ink-100">
        Submit a request
      </span>
      <ModalClose />
    </div>
  );
}
