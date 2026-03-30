import { useCallback, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import * as allOutlineIcons from "@heroicons/react/24/outline";
import Fuse from "fuse.js";
import clsx from "clsx";
import ReactDOM from "react-dom";

import { Folder } from "@/components/Assets/Menu/Folder";
import { File } from "@/components/Assets/Menu/File";

import allLucideIcons from "../../../utils/lucideIcons";
import { useDebounce } from "../hooks/useDebounce";
import useDocument from "../hooks/useDocument";
import useDropdownPosition from "../hooks/dropdownposition";

const icons: Record<string, React.ComponentType<React.ComponentProps<any>>> = {
  ...allOutlineIcons,
  ...allLucideIcons,
  Folder,
  File,
};

const fuse = new Fuse(Object.keys(icons), {
  threshold: 0.3,
});

interface Props {
  workspaceId: string;
  documentId: string;
  disabled: boolean;
  isChild?: boolean;
}

function IconSelector(props: Props) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { onOpen, dropdownPosition } = useDropdownPosition(buttonRef, "top");

  const [{ document: doc }] = useDocument(props.workspaceId, props.documentId);
  const [, setFilteredIcons] = useState(Object.keys(icons));
  const iconKey = props.isChild ? "File" : (doc?.icon ?? "Folder");
  const Icon = icons[iconKey] || (() => null);

  const debouncedSearch = useDebounce((search: string) => {
    if (search === "") {
      setFilteredIcons(Object.keys(icons));
      return;
    }

    const results = fuse.search(search);
    setFilteredIcons(results.map(r => r.item));
  }, 200);

  const onSearchChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const search = e.target.value;
        debouncedSearch(search);
      },
      [debouncedSearch]
    );

  // Prevent the default behavior only for the space key, otherwise
  // the keydown handler for the `Menu.Items` will close the menu
  const onSearchKeyDownHandler: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " ") {
        e.stopPropagation();
      }
    }, []);

  const resetFilteredIcons = useCallback(() => {
    setFilteredIcons(Object.keys(icons));
  }, []);

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

      {/*   {ReactDOM.createPortal(
        <Transition
          as="div"
          style={{
            position: "absolute",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
          className="absolute z-[2000]"
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          afterLeave={resetFilteredIcons}
        >
          <Menu.Items className="absolute -left-0.5 top-4 z-20 mt-2 w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-4 px-4">
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon
                    className="h-4 w-4 text-ink-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="icon-search"
                  id="icon-search"
                  className="pl-8 shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder-gray-400"
                  placeholder="Search icons"
                  onClick={e => e.stopPropagation()}
                  onChange={onSearchChangeHandler}
                  onKeyDown={onSearchKeyDownHandler}
                />
              </div>
            </div>
          </Menu.Items>
        </Transition>,
        document.body
      )} */}
    </Menu>
  );
}

export default IconSelector;
