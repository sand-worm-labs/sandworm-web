import { PiEye } from "react-icons/pi";

import { Tooltip } from "./ToolTips";

// =====================================
// ⬢ Types
// =====================================

interface Props {
  onClick: () => void;
  disabled: boolean;
  tooltipActive: boolean;
}

// =====================================
// ⬢ LiveButton
// =====================================

function LiveButton(props: Props) {
  return (
    <Tooltip
      tooltipClassname="w-40"
      title="Page never saved"
      message="Save this page to see a saved version."
      position="bottom"
      active={props.tooltipActive}
    >
      <button
        type="button"
        onClick={props.onClick}
        disabled={props.disabled}
        className="flex items-center justify-center
          border-none bg-transparent hover:bg-base-600 p-2 rounded-full
          text-[#1C3B5A] dark:text-ink-400
          disabled:cursor-not-allowed disabled:opacity-90"
      >
        <PiEye size={18} />
      </button>
    </Tooltip>
  );
}

export default LiveButton;
