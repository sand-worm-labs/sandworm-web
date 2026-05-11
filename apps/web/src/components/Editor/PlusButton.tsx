import {
  PencilSquareIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlockType } from "@sandworm/editor";
import { CalendarIcon, QueueListIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { PiMarkdownLogoLight } from "react-icons/pi";

import { TextIcon } from "../Assets/Blocks/TextIcon";
import { DatabaseIcon } from "../Assets/Blocks/DatabaseIcon";
import { CodeIcon } from "../Assets/Blocks/CodeIcon";
import { ChartbarIcon } from "../Assets/Blocks/ChartbarIcon";
import { CubeIcon } from "../Assets/Blocks/CubeIcon";
import { KeyboardIcon } from "../Assets/Blocks/KeyboardIcon";
import { LightningIcon } from "../Assets/Blocks/LightningIcon";

import { PowerToolboxModal } from "./blocks/customBlocks/PowerToolbox";

// =====================================
// ⬢ Utils
// =====================================
const TriangleUp = () => (
  <div className="h-3 w-3 bg-white dark:bg-base-100 border-t border-l border-border-secondary rotate-45 translate-y-1/2" />
);

// =====================================
// ⬢ BlockSuggestion
// =====================================
type BlockSuggestionProps = {
  id: string;
  icon: JSX.Element;
  text: string;
  onAdd: () => void;
};

function BlockSuggestion(props: BlockSuggestionProps) {
  const onClick = useCallback(() => {
    props.onAdd();
  }, [props.onAdd]);

  return (
    <div id={props.id} className="w-full text-sm px-1 relative z-30">
      <button
        type="button"
        className="w-full transition-colors transition-100 flex items-center justify-center gap-x-2 p-2 py-2.5 rounded-full text-[#6C757D] dark:text-ink-400 bg-white dark:bg-base-100 hover:border-[#A308F0] border border-border-secondary dark:border-border-tertiary font-body font-normal text-sm"
        onClick={onClick}
      >
        {props.icon}
        <span>{props.text}</span>
      </button>
    </div>
  );
}

// =====================================
// ⬢ MultiBlockSuggestion
// =====================================
interface MultiBlockSuggestionProps {
  icon: JSX.Element;
  text: string;
  options: { icon: JSX.Element; text: string; onClick: () => void }[];
}

function MultiBlockSuggestion(props: MultiBlockSuggestionProps) {
  return (
    <Menu as="div" className="w-full text-sm px-1 relative z-30">
      <Menu.Button className="w-full transition-colors transition-100 flex items-center justify-center gap-x-2 p-2 rounded-full text-[#6C757D] dark:text-ink-400 bg-white dark:bg-base-100 hover:text-gray-700 relative border border-border-secondary dark:border-border-tertiary py-2.5 hover:border-[#A308F0]">
        {props.icon}
        <span>{props.text}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </Menu.Button>
      <Transition
        as="div"
        className="absolute right-0 z-40"
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Menu.Items
          as="div"
          className="w-44 mt-2 rounded-lg bg-white dark:bg-base-100 shadow-lg ring-1 ring-black dark:ring-border-tertiary ring-opacity-5 focus:outline-none font-body divide-y divide-border-secondary"
        >
          {props.options.map((option, index) => (
            <Menu.Item key={option.text}>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? "bg-base-100 text-ink-100" : "text-ink-400",
                    index === 0 ? "rounded-t-md" : "",
                    index === props.options.length - 1 ? "rounded-b-md" : "",
                    "flex items-center gap-x-2 w-full text-sm px-4 py-3"
                  )}
                  onClick={option.onClick}
                >
                  {option.icon}
                  {option.text}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

// =====================================
// ⬢ BlockList
// =====================================
interface BlockListProps {
  workspaceId: string;
  onAddBlock: (type: BlockType) => void;
  onOpenToolbox: () => void;
}

function BlockList(props: BlockListProps) {
  const ff = { visualizationsV2: true };
  console.log(props.workspaceId);

  const onAddSQL = useCallback(
    () => props.onAddBlock(BlockType.SQL),
    [props.onAddBlock]
  );
  const onAddPython = useCallback(
    () => props.onAddBlock(BlockType.Python),
    [props.onAddBlock]
  );
  const onAddRichText = useCallback(
    () => props.onAddBlock(BlockType.RichText),
    [props.onAddBlock]
  );
  const onAddMarkdown = useCallback(
    () => props.onAddBlock(BlockType.Markdown),
    [props.onAddBlock]
  );
  const onAddVisualization = useCallback(
    () =>
      props.onAddBlock(
        ff.visualizationsV2
          ? BlockType.VisualizationV2
          : BlockType.Visualization
      ),
    [props.onAddBlock]
  );
  const onAddPivotTable = useCallback(
    () => props.onAddBlock(BlockType.PivotTable),
    [props.onAddBlock]
  );
  const onAddInput = useCallback(
    () => props.onAddBlock(BlockType.Input),
    [props.onAddBlock]
  );
  const onAddDropdownInput = useCallback(
    () => props.onAddBlock(BlockType.DropdownInput),
    [props.onAddBlock]
  );
  const onAddDateInput = useCallback(
    () => props.onAddBlock(BlockType.DateInput),
    [props.onAddBlock]
  );

  return (
    <div className="w-full absolute z-30 -translate-y-2 font-body">
      <div className="w-full flex justify-center relative z-30">
        <TriangleUp />
      </div>

      <div className="w-full py-1 flex items-center justify-center bg-base-100">
        <BlockSuggestion
          id="add-block-power"
          icon={<LightningIcon className="w-[20px] h-[20px]" />}
          onAdd={props.onOpenToolbox}
          text="Toolbox"
        />

        {/* Text → choose between Rich Text and Markdown */}
        <MultiBlockSuggestion
          icon={<TextIcon className="w-[20px] h-[20px]" />}
          text="Text"
          options={[
            {
              icon: <PencilSquareIcon className="w-4 h-4" />,
              text: "Rich Text",
              onClick: onAddRichText,
            },
            {
              icon: <PiMarkdownLogoLight className="w-4 h-4" />,
              text: "Markdown",
              onClick: onAddMarkdown,
            },
          ]}
        />

        <BlockSuggestion
          id="add-block-query"
          icon={<DatabaseIcon className="w-[20px] h-[20px]" />}
          onAdd={onAddSQL}
          text="Query"
        />
        <BlockSuggestion
          id="add-block-python"
          icon={<CodeIcon className="w-[20px] h-[20px]" />}
          onAdd={onAddPython}
          text="Python"
        />
        <BlockSuggestion
          id="add-block-visualization"
          icon={<ChartbarIcon className="w-[20px] h-[20px]" />}
          onAdd={onAddVisualization}
          text="Visualization"
        />
        <BlockSuggestion
          id="add-block-pivot"
          icon={<CubeIcon className="w-[20px] h-[20px]" />}
          onAdd={onAddPivotTable}
          text="Pivot"
        />

        <MultiBlockSuggestion
          icon={<KeyboardIcon className="w-[20px] h-[20px]" />}
          text="Input"
          options={[
            {
              icon: <PencilSquareIcon className="w-4 h-4" />,
              text: "Text",
              onClick: onAddInput,
            },
            {
              icon: <QueueListIcon className="w-4 h-4" />,
              text: "Dropdown",
              onClick: onAddDropdownInput,
            },
            {
              icon: <CalendarIcon className="w-4 h-4" />,
              text: "Date",
              onClick: onAddDateInput,
            },
          ]}
        />
      </div>
    </div>
  );
}

// =====================================
// ⬢ useClickOutside
// =====================================
const useClickOutside = (
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) => {
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    },
    [ref, callback]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);
};

// =====================================
// ⬢ PlusButton
// =====================================
interface Props {
  workspaceId: string;
  alwaysOpen: boolean;
  onAddBlock: (type: BlockType) => void;
  onAddAnalyticsBlock: (toolId: string) => void;
  isEditable: boolean;
  writebackEnabled: boolean;
  isLast: boolean;
}

function PlusButton(props: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);

  const toggleOptions = useCallback(() => setShowOptions(prev => !prev), []);
  const handleOpenToolbox = useCallback(() => {
    setShowOptions(false);
    setIsToolboxOpen(true);
  }, []);
  const handleToolboxClose = useCallback(() => setIsToolboxOpen(false), []);
  const handleSelectTool = useCallback(
    (toolId: string) => {
      props.onAddAnalyticsBlock(toolId);
      setIsToolboxOpen(false);
    },
    [props.onAddAnalyticsBlock]
  );

  useClickOutside(wrapperRef, () => {
    setShowOptions(false);
    // Do NOT close isToolboxOpen here — HeadlessUI Dialog manages its own backdrop
  });

  const addBlockHandler = useCallback(
    (type: BlockType) => {
      props.onAddBlock(type);
      setShowOptions(false);
    },
    [props.onAddBlock]
  );

  const btnDivProps = props.isLast ? { id: "last-plus-button" } : {};

  return (
    <>
      <div
        {...btnDivProps}
        className="w-full group relative py-2"
        ref={wrapperRef}
      >
        <button
          type="button"
          className={clsx(
            "flex items-center justify-center gap-x-2 group-hover:opacity-100 transition-opacity duration-200 w-full h-6",
            !props.isEditable && "invisible",
            props.alwaysOpen || showOptions || props.isLast
              ? "opacity-100"
              : "opacity-0"
          )}
          onClick={toggleOptions}
        >
          <div className="w-full h-[1px] bg-[#E9ECEF] dark:bg-border-tertiary font-body" />
          <div className="flex text-[#6C757D] dark:text-ink-400 font-medium justify-center items-center gap-x-1 text-[12px] whitespace-nowrap">
            <PlusIcon className="h-3 w-3 text-[#6C757D] dark:text-ink-400" />
            <span>Add block</span>
          </div>
          <div className="w-full h-[1px] bg-[#E9ECEF] dark:bg-border-tertiary" />
        </button>

        {props.isEditable && (showOptions || props.alwaysOpen) && (
          <BlockList
            workspaceId={props.workspaceId}
            onAddBlock={addBlockHandler}
            onOpenToolbox={handleOpenToolbox}
          />
        )}
      </div>

      <PowerToolboxModal
        isOpen={isToolboxOpen}
        onClose={handleToolboxClose}
        onSelectTool={handleSelectTool}
      />
    </>
  );
}

export default PlusButton;
