import {
  CheckIcon,
  CommandLineIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/20/solid";

import type { AiBlockStatus } from "../hooks/useAiDiff";

// 🎨 Interface / Props Definition
// =====================================
interface Props {
  visible: boolean;
  status?: AiBlockStatus;
  onAccept: () => void;
  onReject: () => void;
  onUndo?: () => void;
  canTry: boolean;
  onTry: () => void;
}

// ApproveDiffButtons Component
// =====================================
// Shows buttons to accept, reject, try, or undo an AI-generated suggestion.
// Switches to a confirmation state after accept/reject with an undo affordance.
// =====================================
function ApproveDiffButtons({
  visible,
  status,
  onAccept,
  onReject,
  onUndo,
  canTry,
  onTry,
}: Props) {
  if (!visible) return null;

  if (status === "accepted") {
    return (
      <div className="print:hidden px-2 pb-3 flex w-full justify-end items-center gap-x-2">
        <span className="flex items-center gap-x-1 text-xs text-green-700 font-medium">
          <CheckIcon className="h-3.5 w-3.5" /> Accepted
        </span>
        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-x-1 px-2 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 text-xs transition-colors"
        >
          <ArrowUturnLeftIcon className="h-3 w-3" /> Undo
        </button>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="print:hidden px-2 pb-3 flex w-full justify-end items-center gap-x-2">
        <span className="flex items-center gap-x-1 text-xs text-red-600 font-medium">
          <XMarkIcon className="h-3.5 w-3.5" /> Rejected
        </span>
        <button
          type="button"
          onClick={onUndo}
          className="flex items-center gap-x-1 px-2 py-1 rounded border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 text-xs transition-colors"
        >
          <ArrowUturnLeftIcon className="h-3 w-3" /> Undo
        </button>
      </div>
    );
  }

  return (
    <div className="print:hidden px-2 pb-3 flex w-full justify-end items-center gap-x-2">
      <button
        type="button"
        className="border border-gray-300 bg-white rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-gray-700 hover:bg-gray-100 text-xs disabled:bg-gray-200 disabled:cursor-not-allowed"
        onClick={onTry}
        disabled={!canTry}
      >
        <CommandLineIcon className="h-3 w-3" /> Try suggestion
      </button>
      <button
        type="button"
        className="border border-red-300 bg-red-50 rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-red-700 hover:bg-red-100 text-xs"
        onClick={onReject}
      >
        <XMarkIcon className="h-3 w-3" /> Reject
      </button>
      <button
        type="button"
        className="border border-primary-400 bg-primary-100 rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-primary-700 hover:bg-primary-200 text-xs"
        onClick={onAccept}
      >
        <CheckIcon className="h-3 w-3" /> Accept
      </button>
    </div>
  );
}

export default ApproveDiffButtons;
