import { Menu } from "@headlessui/react";
import { PiCode } from "react-icons/pi";
import { useRef } from "react";

import { TooltipV2 } from "./ToolTips";

interface Props {
  onFormat: () => void;
  disabled: boolean;
}

function FormatSQLButton(props: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Menu as="div" className="inline-block">
      {({ open }) => {
        return (
          <TooltipV2<HTMLButtonElement>
            message="Format and structure your SQL code for better readability."
            referenceRef={buttonRef}
            active={!open}
          >
            {ref => (
              <Menu.Button
                ref={ref}
                className="bg-[#F8F9FA] rounded-[5px] border border-border dark:border-border-tertiary h-[24px] min-w-[24px] flex items-center justify-center relative group hover:bg-gray-50"
                onClick={props.onFormat}
                disabled={props.disabled}
              >
                <PiCode className="w-[13px] h-[13px] text-[#1C3B5A]" />
              </Menu.Button>
            )}
          </TooltipV2>
        );
      }}
    </Menu>
  );
}

export default FormatSQLButton;
