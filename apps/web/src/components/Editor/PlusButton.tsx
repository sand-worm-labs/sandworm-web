import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { BlockType } from "@sandworm/editor";
import { Menu, Transition } from "@headlessui/react";
import {
  PiPlus,
  PiCaretDown,
  PiDotsThree,
  PiMarkdownLogoLight,
  PiCalendarDots,
  PiListPlusLight,
} from "react-icons/pi";

import { TextIcon } from "../Assets/Blocks/TextIcon";
import { DatabaseIcon } from "../Assets/Blocks/DatabaseIcon";
import { CodeIcon } from "../Assets/Blocks/CodeIcon";
import { ChartbarIcon } from "../Assets/Blocks/ChartbarIcon";
import { CubeIcon } from "../Assets/Blocks/CubeIcon";
import { KeyboardIcon } from "../Assets/Blocks/KeyboardIcon";
import { LightningIcon } from "../Assets/Blocks/LightningIcon";

import { PowerToolboxModal } from "./blocks/customBlocks/PowerToolbox";

// =====================================
// ⬢ Types
// =====================================
type PillOption = {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
};

interface SinglePillDef {
  kind: "single";
  id: string;
  icon: JSX.Element;
  text: string;
  onAdd: () => void;
}

interface MultiPillDef {
  kind: "multi";
  id: string;
  icon: JSX.Element;
  text: string;
  options: PillOption[];
}

type PillDef = SinglePillDef | MultiPillDef;

interface OverflowItem {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
}

// =====================================
// ⬢ Utils
// =====================================
const TriangleUp = () => (
  <div className="h-3 w-3 bg-white dark:bg-base-100 border-t border-l border-border-secondary rotate-45 translate-y-1/2" />
);

function pillToOverflowItems(pill: PillDef): OverflowItem[] {
  if (pill.kind === "single") {
    return [{ icon: pill.icon, text: pill.text, onClick: pill.onAdd }];
  }
  return pill.options.map(o => ({
    icon: o.icon,
    text: o.text,
    onClick: o.onClick,
  }));
}

// =====================================
// ⬢ useContainerWidth
// =====================================
function useContainerWidth(ref: React.RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(9999);

  useEffect(() => {
    const el = ref.current;
    if (!el) return () => {};
    setWidth(el.offsetWidth);
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

// =====================================
// ⬢ BlockSuggestion
// =====================================
type BlockSuggestionProps = {
  id: string;
  icon: JSX.Element;
  text: string;
  onAdd: () => void;
};

function BlockSuggestion({ id, icon, text, onAdd }: BlockSuggestionProps) {
  const onClick = useCallback(() => onAdd(), [onAdd]);

  return (
    <div id={id} className="w-full text-sm px-1 relative z-30">
      <button
        type="button"
        className="w-full transition-colors transition-100 flex items-center justify-center gap-x-2 p-2 py-2.5 rounded-full text-[#6C757D] dark:text-ink-400 bg-white dark:bg-base-100 hover:border-[#A308F0] border border-border-secondary dark:border-border-tertiary font-body font-normal text-sm"
        onClick={onClick}
      >
        {icon}
        <span>{text}</span>
      </button>
    </div>
  );
}

// =====================================
// ⬢ MultiBlockSuggestion
// =====================================
interface MultiBlockSuggestionProps {
  id?: string;
  icon: JSX.Element;
  text: string;
  options: PillOption[];
}

function MultiBlockSuggestion({
  id,
  icon,
  text,
  options,
}: MultiBlockSuggestionProps) {
  return (
    <Menu as="div" id={id} className="w-full text-sm px-1 relative z-30">
      <Menu.Button className="w-full transition-colors transition-100 flex items-center justify-center gap-x-2 p-2 rounded-full text-[#6C757D] dark:text-ink-400 bg-white dark:bg-base-100 hover:text-gray-700 relative border border-border-secondary dark:border-border-tertiary py-2.5 hover:border-[#A308F0]">
        {icon}
        <span>{text}</span>
        <PiCaretDown size={14} />
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
          className="w-44 mt-2 rounded-2xl bg-white dark:bg-base-100 shadow-sm ring-1 ring-border-secondary dark:ring-border-tertiary focus:outline-none font-body px-1.5 py-1.5"
        >
          {options.map((option, index) => (
            <Menu.Item key={option.text}>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? "bg-primary/20 text-ink-100" : "text-ink-400",
                    index === 0 ? "rounded-lg" : "",
                    index === options.length - 1 ? "rounded-lg" : "",
                    "flex items-center gap-x-2 w-full text-sm px-2 py-1.5 mb-0.5 hover:bg-primary/20 rounded-lg"
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
// ⬢ OverflowMenu
// =====================================

function OverflowMenu({ items }: { items: OverflowItem[] }) {
  return (
    <Menu as="div" className="w-auto min-w-[120px] text-sm px-1 relative z-30">
      <Menu.Button
        aria-label="More block types"
        className="w-full transition-colors transition-100 flex items-center justify-center gap-x-2 p-2 py-2.5 rounded-full text-[#6C757D] dark:text-ink-400 bg-white dark:bg-base-100 border border-border-secondary dark:border-border-tertiary hover:border-[#A308F0]"
      >
        <PiDotsThree size={16} />
        <span>More</span>
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
          className="w-44 mt-2 rounded-2xl bg-white dark:bg-base-100 shadow-sm ring-1 ring-border-secondary dark:ring-border-tertiary focus:outline-none font-body px-1.5 py-1.5"
        >
          {items.map((item, index) => (
            <Menu.Item key={item.text}>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    active ? "bg-primary/20 text-ink-100" : "text-ink-400",
                    index === 0 || index === items.length - 1
                      ? "rounded-lg"
                      : "",
                    "flex items-center gap-x-2 w-full text-sm px-2 py-1.5 mb-0.5 hover:bg-primary/20 rounded-lg"
                  )}
                  onClick={item.onClick}
                >
                  {item.icon}
                  {item.text}
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

  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(
    containerRef as React.RefObject<HTMLElement>
  );

  const visibleCount = (() => {
    if (containerWidth >= 975) return 7;
    if (containerWidth >= 840) return 6;
    if (containerWidth >= 710) return 5;
    if (containerWidth >= 580) return 4;
    return 3;
  })();

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

  const pills: PillDef[] = [
    {
      kind: "single",
      id: "add-block-power",
      icon: <LightningIcon className="w-[20px] h-[20px]" />,
      text: "Toolbox",
      onAdd: props.onOpenToolbox,
    },
    {
      kind: "single",
      id: "add-block-query",
      icon: <DatabaseIcon className="w-[20px] h-[20px]" />,
      text: "Query",
      onAdd: onAddSQL,
    },
    {
      kind: "single",
      id: "add-block-python",
      icon: <CodeIcon className="w-[20px] h-[20px]" />,
      text: "Python",
      onAdd: onAddPython,
    },
    {
      kind: "multi",
      id: "add-block-text",
      icon: <TextIcon className="w-[20px] h-[20px]" />,
      text: "Text",
      options: [
        {
          icon: <TextIcon className="w-4 h-4" />,
          text: "Rich Text",
          onClick: onAddRichText,
        },
        {
          icon: <PiMarkdownLogoLight className="w-4 h-4" />,
          text: "Markdown",
          onClick: onAddMarkdown,
        },
      ],
    },
    {
      kind: "single",
      id: "add-block-visualization",
      icon: <ChartbarIcon className="w-[20px] h-[20px]" />,
      text: "Charts",
      onAdd: onAddVisualization,
    },
    {
      kind: "single",
      id: "add-block-pivot",
      icon: <CubeIcon className="w-[20px] h-[20px]" />,
      text: "Pivot",
      onAdd: onAddPivotTable,
    },
    {
      kind: "multi",
      id: "add-block-input",
      icon: <KeyboardIcon className="w-[20px] h-[20px]" />,
      text: "Input",
      options: [
        {
          icon: <TextIcon className="w-4 h-4" />,
          text: "Text Input",
          onClick: onAddInput,
        },
        {
          icon: <PiListPlusLight className="w-4 h-4" />,
          text: "Dropdown",
          onClick: onAddDropdownInput,
        },
        {
          icon: <PiCalendarDots className="w-4 h-4" />,
          text: "Date",
          onClick: onAddDateInput,
        },
      ],
    },
  ];

  const visiblePills = pills.slice(0, visibleCount);
  const overflowPills = pills.slice(visibleCount);
  const overflowItems = overflowPills.flatMap(pillToOverflowItems);

  return (
    <div className="w-full absolute z-30 -translate-y-2 font-body">
      <div className="w-full flex justify-center relative z-30">
        <TriangleUp />
      </div>

      <div
        ref={containerRef}
        className="w-full py-1 flex items-center justify-center bg-base-100"
      >
        {visiblePills.map(pill =>
          pill.kind === "single" ? (
            <BlockSuggestion
              key={pill.id}
              id={pill.id}
              icon={pill.icon}
              text={pill.text}
              onAdd={pill.onAdd}
            />
          ) : (
            <MultiBlockSuggestion
              key={pill.id}
              id={pill.id}
              icon={pill.icon}
              text={pill.text}
              options={pill.options}
            />
          )
        )}

        {overflowItems.length > 0 && <OverflowMenu items={overflowItems} />}
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
            <PiPlus size={12} />
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
