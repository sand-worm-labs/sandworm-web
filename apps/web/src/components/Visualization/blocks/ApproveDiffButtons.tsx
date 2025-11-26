import {
  CheckIcon,
  CommandLineIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";

// 🎨 Interface / Props Definition
// =====================================
interface Props {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
  canTry: boolean;
  onTry: () => void;
}

// ApproveDiffButtons Component
// =====================================
// Shows buttons to accept, reject, or try an AI-generated suggestion.
// Visibility and button state are controlled via props.
// =====================================
function ApproveDiffButtons(props: Props) {
  return (
    <div
      className={clsx(
        props.visible ? "block" : "hidden",
        "print:hidden font-syne px-2 pb-3 flex w-full justify-end items-center gap-x-2"
      )}
    >
      <button
        type="button"
        className="border border-gray-300 bg-white rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-gray-700 hover:bg-gray-100 text-xs disabled:bg-gray-200 disabled:cursor-not-allowed"
        onClick={props.onTry}
        disabled={!props.canTry}
      >
        <CommandLineIcon className="h-3 w-3" /> Try suggestion
      </button>
      <button
        type="button"
        className="border border-red-300 bg-red-50 rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-red-700 hover:bg-red-100 text-xs"
        onClick={props.onReject}
      >
        <XMarkIcon className="h-3 w-3" /> Reject
      </button>
      <button
        type="button"
        className="border border-primary-400 bg-primary-100 rounded-sm px-2 py-1 flex items-center justify-center gap-x-1 shadow-sm text-primary-700 hover:bg-[#C7665C] text-xs"
        onClick={props.onAccept}
      >
        <CheckIcon className="h-3 w-3" /> Accept
      </button>
    </div>
  );
}

export default ApproveDiffButtons;
