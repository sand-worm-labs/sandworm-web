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
        className="flex items-center gap-1.5
          rounded-lg px-3 py-1 text-sm font-body
          bg-white dark:bg-base-100
          border border-border-tertiary dark:border-border-tertiary
          text-ink-400 dark:text-ink-100
          hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]
          disabled:cursor-not-allowed disabled:opacity-90
          group overflow-hidden
          max-w-[42px] xl:max-w-[136px] hover:max-w-[136px]
          transition-[max-width] duration-300"
      >
        <PiEye size={16} className="flex-shrink-0" />
        <span
          className="opacity-0 group-hover:opacity-100 xl:opacity-100
          transition-opacity duration-300 whitespace-nowrap overflow-hidden"
        >
          Saved version
        </span>
      </button>
    </Tooltip>
  );
}

export default LiveButton;
