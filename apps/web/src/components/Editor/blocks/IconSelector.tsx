import { useRef } from "react";
import { Menu } from "@headlessui/react";
import * as allOutlineIcons from "@heroicons/react/24/outline";
import clsx from "clsx";

import { Folder } from "@/components/Assets/Menu/Folder";
import { File } from "@/components/Assets/Menu/File";

import allLucideIcons from "../../../utils/lucideIcons";
import useDocument from "../hooks/useDocument";

const icons: Record<string, React.ComponentType<React.ComponentProps<any>>> = {
  ...allOutlineIcons,
  ...allLucideIcons,
  Folder,
  File,
};

interface Props {
  workspaceId: string;
  documentId: string;
  disabled: boolean;
  isChild?: boolean;
}

function IconSelector(props: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [{ document: doc }] = useDocument(props.workspaceId, props.documentId);
  const iconKey = props.isChild ? "File" : (doc?.icon ?? "Folder");
  const Icon = icons[iconKey] || (() => null);

  return (
    <Menu as="div" className="relative flex items-center">
      <Menu.Button
        as="div"
        ref={buttonRef}
        className={clsx(
          {
            "hover:bg-ceramic-200": !props.disabled,
          },
          "flex items-center rounded-md p-0.5"
        )}
        disabled={props.disabled}
      >
        <Icon
          aria-hidden="true"
          size={18}
          className="text-[#616A79] dark:text-ink-400"
        />
      </Menu.Button>
    </Menu>
  );
}

export default IconSelector;
