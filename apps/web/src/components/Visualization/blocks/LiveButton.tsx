import { EyeIcon } from "@heroicons/react/24/outline";

import { Tooltip } from "./ToolTips";

interface Props {
  onClick: () => void;
  disabled: boolean;
  tooltipActive: boolean;
}
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
        className="flex items-center rounded-sm px-3 py-1 text-sm bg-white dark:bg-black dark:text-ink-300  hover:bg-gray-100 dark:hover:bg-[#181C21] text-gray-500 border dark:border-[#262A30] border-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100  group overflow-hidden group max-w-[42px] xl:max-w-[136px] hover:max-w-[136px] transition-mw duration-500"
        onClick={props.onClick}
        disabled={props.disabled}
      >
        <EyeIcon className="min-w-4 min-h-4" />

        <span className="ml-2 opacity-0 group-hover:opacity-100 xl:opacity-100 duration-500 transition-opacity text-clip text-nowrap">
          Saved version
        </span>
      </button>
    </Tooltip>
  );
}

export default LiveButton;
