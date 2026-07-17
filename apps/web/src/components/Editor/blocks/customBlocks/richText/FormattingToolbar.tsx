import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDownIcon, PhotoIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { CheckIcon, LinkIcon } from "@heroicons/react/24/solid";

type NodeType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "numbered-list"
  | "task-list";

type OpenMenu = "node-type" | "color" | null;

type ColorSpec = { name: string; type: "fg" | "bg"; hex: string };

const items: Record<NodeType, { name: string; type: NodeType }> = {
  paragraph: { name: "Paragraph", type: "paragraph" },
  "heading-1": { name: "Heading 1", type: "heading-1" },
  "heading-2": { name: "Heading 2", type: "heading-2" },
  "heading-3": { name: "Heading 3", type: "heading-3" },
  "bullet-list": { name: "Bullet list", type: "bullet-list" },
  "numbered-list": { name: "Numbered list", type: "numbered-list" },
  "task-list": { name: "Task list", type: "task-list" },
};

const bgColors: ColorSpec[] = [
  { name: "Default", type: "bg", hex: "transparent" },
  { name: "Gray", type: "bg", hex: "#ebeced" },
  { name: "Brown", type: "bg", hex: "#e9e5e3" },
  { name: "Orange", type: "bg", hex: "#f6e9d9" },
  { name: "Yellow", type: "bg", hex: "#fbf3db" },
  { name: "Green", type: "bg", hex: "#ddedea" },
  { name: "Blue", type: "bg", hex: "#ddebf1" },
  { name: "Purple", type: "bg", hex: "#eae4f2" },
  { name: "Pink", type: "bg", hex: "#f4dfeb" },
  { name: "Red", type: "bg", hex: "#fbe4e4" },
];

const textColors: ColorSpec[] = [
  { name: "Default", type: "fg", hex: "#374151" },
  { name: "Gray", type: "fg", hex: "#455768" },
  { name: "Brown", type: "fg", hex: "#64473a" },
  { name: "Orange", type: "fg", hex: "#d9730d" },
  { name: "Yellow", type: "fg", hex: "#dfab01" },
  { name: "Green", type: "fg", hex: "#4d6461" },
  { name: "Blue", type: "fg", hex: "#0b6e99" },
  { name: "Purple", type: "fg", hex: "#6940a5" },
  { name: "Pink", type: "fg", hex: "#ad1a72" },
  { name: "Red", type: "fg", hex: "#e03e3e" },
];

const stopBlur = (e: React.MouseEvent) => e.preventDefault();

const getCurrentType = (editor: Editor): NodeType => {
  if (editor.isActive("heading")) {
    const { level } = editor.getAttributes("heading");
    switch (level) {
      case 1:
        return "heading-1";
      case 2:
        return "heading-2";
      case 3:
        return "heading-3";
      default:
        return "heading-1";
    }
  }
  if (editor.isActive("bulletList")) return "bullet-list";
  if (editor.isActive("orderedList")) return "numbered-list";
  if (editor.isActive("taskList")) return "task-list";
  return "paragraph";
};

const NodeTypeDropdown = ({
  editor,
  open,
  onToggle,
  onClose,
}: {
  editor: Editor;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const currentType: NodeType = getCurrentType(editor);

  const setNodeType = useCallback(
    (nodeType: NodeType) => {
      onClose();
      switch (nodeType) {
        case "paragraph":
          editor.chain().focus().setParagraph().run();
          break;
        case "heading-1":
          editor.chain().focus().setHeading({ level: 1 }).run();
          break;
        case "heading-2":
          editor.chain().focus().setHeading({ level: 2 }).run();
          break;
        case "heading-3":
          editor.chain().focus().setHeading({ level: 3 }).run();
          break;
        case "bullet-list":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "numbered-list":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "task-list":
          editor.chain().focus().toggleTaskList().run();
          break;
        default:
          editor.chain().focus().setParagraph().run();
      }
    },
    [editor, onClose]
  );

  return (
    <div className="inline-flex relative">
      <button
        type="button"
        onMouseDown={stopBlur}
        onClick={onToggle}
        className="relative inline-flex gap-x-1 items-center hover:bg-primary/20 py-1.5 px-1.5 rounded-md dark:hover:bg-base-600 "
      >
        {items[currentType].name}
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40"
            onMouseDown={onClose}
            type="button"
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-8 z-50 rounded-xl dark:bg-base-100 bg-white ring-1 ring-border-tertiary  whitespace-nowrap  ">
            <div className="py-0.5">
              {Object.values(items).map(item => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={stopBlur}
                  onClick={() => setNodeType(item.type)}
                  className="block w-full px-4 py-2 text-left text-ink-400 hover:bg-primary/15 dark:hover:bg-base-600 dark:text-ink-100 font-medium   "
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ToggleFormattingButton = (props: {
  children: React.ReactNode;
  name: string;
  shortcut: string;
  type: string;
  onToggle: () => void;
  editor: Editor;
}) => {
  const isActive = props.editor.isActive(props.type);

  return (
    <button
      type="button"
      onMouseDown={stopBlur}
      onClick={props.onToggle}
      className={clsx(
        isActive ? "bg-gray-100 dark:bg-base-100" : "",
        "h-full text-sm px-2.5 hover:bg-primary/20 dark:hover:bg-base-600  relative rounded-md group/toggle-button"
      )}
    >
      {props.children}
      <span className="sr-only">{props.name}</span>
      <div className="font-body pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover/toggle-button:opacity-100 bg-black text-white text-xs p-2 rounded-md flex flex-col gap-y-1 shadow-lg z-[9999]">
        <span>{props.name}</span>
        <span className="text-xs text-ink-400 flex gap-x-0.5 justify-center items-center">
          {props.shortcut.split("").map((key, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={`${key}-${i}`}>{key}</span>
          ))}
        </span>
      </div>
    </button>
  );
};

const ColorOption = (props: {
  color: ColorSpec;
  onShiftColor: (color: ColorSpec) => void;
  isSelected: boolean;
}) => (
  <button
    type="button"
    onMouseDown={stopBlur}
    className="flex gap-x-1 items-center hover:bg-primary/20 px-2 py-1 rounded-lg w-full dark:hover:bg-base-600 "
    onClick={() => props.onShiftColor(props.color)}
  >
    <div
      className="rounded-md border border-border-secondary p-0.5 dark:border-border-tertiary"
      style={{
        backgroundColor: props.color.type === "bg" ? props.color.hex : "#fff",
        color: props.color.type === "fg" ? props.color.hex : "#000",
      }}
    >
      <span className="text-[10px] px-1">A</span>
    </div>
    <div className="flex items-center justify-between gap-x-8 w-full">
      <span>{props.color.name}</span>
      <span className={clsx({ "opacity-0": !props.isSelected })}>
        <CheckIcon className="h-3 w-3 text-gray-600" />
      </span>
    </div>
  </button>
);

const ColorTextButton = (props: {
  editor: Editor;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) => {
  const currentColor = props.editor.getAttributes("textStyle").color;
  const currentBgColor = props.editor.getAttributes("highlight").color;

  const onShiftColor = useCallback(
    (color: ColorSpec) => {
      if (color.type === "bg") {
        props.editor.chain().focus().setHighlight({ color: color.hex }).run();
      } else {
        props.editor.commands.setColor(color.hex);
      }
    },
    [props.editor]
  );

  return (
    <div className="pr-0.5 py-[1px] h-full relative group/toggle-button">
      <button
        type="button"
        onMouseDown={stopBlur}
        onClick={props.onToggle}
        className="h-full text-sm px-2.5 rounded-md ring-1 ring-inset ring-gray-200 dark:ring-editor-200 relative"
        style={{
          color: currentColor ?? "inherit",
          backgroundColor: currentBgColor ?? "inherit",
        }}
      >
        <div className="h-full w-full absolute top-0 left-0 flex items-center justify-center hover:bg-gray-100/30 rounded-md" />
        <span className="font-bold text-xs">A</span>
      </button>

      <div className="font-body pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover/toggle-button:opacity-100 bg-black text-white text-xs p-2 rounded-md shadow-lg z-[9999]">
        <span>Colors</span>
      </div>

      {props.open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40"
            onMouseDown={props.onClose}
          />
          <div
            onPointerDown={stopBlur}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-base-100 border  dark:border-border-tertiary border-border-tertiary px-1 py-2 flex gap-x-2 rounded-xl z-50"
          >
            <div className="flex flex-col gap-y-1">
              <span className="font-medium px-2 dark:text-white">Text</span>
              {textColors.map(color => (
                <ColorOption
                  key={color.name}
                  color={color}
                  onShiftColor={onShiftColor}
                  isSelected={
                    (color.name === "Default" && !currentColor) ||
                    color.hex === currentColor
                  }
                />
              ))}
            </div>
            <div className="flex flex-col gap-y-1">
              <span className="font-medium px-2 dark:text-white">
                Background
              </span>
              {bgColors.map(color => (
                <ColorOption
                  key={color.name}
                  color={color}
                  onShiftColor={onShiftColor}
                  isSelected={
                    (color.name === "Default" && !currentBgColor) ||
                    color.hex === currentBgColor
                  }
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const AddImageButton = ({ editor }: { editor: Editor }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        editor.chain().focus().setImage({ src, alt: file.name }).run();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [editor]
  );

  return (
    <div className="relative h-full">
      <button
        type="button"
        onMouseDown={stopBlur}
        onClick={() => inputRef.current?.click()}
        className="h-full text-sm px-2.5 hover:bg-primary/20 dark:hover:bg-base-600  relative rounded-md group/toggle-button"
      >
        <PhotoIcon className="h-4 w-4" />
        <div className="font-body pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover/toggle-button:opacity-100 bg-black text-white text-xs p-2 rounded-md shadow-lg z-[9999]">
          <span>Insert image</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

const AddLinkButton = (props: {
  children: React.ReactNode;
  onLink: (url: string) => void;
  onUnlink: () => void;
  editor: Editor;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [url, setUrl] = useState("");

  const isActive = props.editor.getAttributes("link").href;

  const toggleShowLinkForm = useCallback(() => {
    setShowLinkForm(prev => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 0);
      else setUrl("");
      return !prev;
    });
  }, []);

  const onClickLinkButton = useCallback(() => {
    if (isActive) {
      props.onUnlink();
      return;
    }
    toggleShowLinkForm();
  }, [isActive, props.onUnlink, toggleShowLinkForm]);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      props.onLink(url);
      toggleShowLinkForm();
    },
    [props.onLink, url, toggleShowLinkForm]
  );

  useEffect(() => {
    if (props.editor.view.state.selection.empty) {
      setShowLinkForm(false);
    }
  }, [props.editor.view.state.selection.empty]);

  return (
    <div className="relative h-full">
      <button
        type="button"
        onMouseDown={stopBlur}
        onClick={onClickLinkButton}
        className={clsx(
          isActive ? "bg-gray-100 dark:bg-editor-400" : "",
          "h-full text-sm px-2.5 dark:hover:bg-base-600 hover:bg-primary/20 relative rounded-md group/toggle-button"
        )}
      >
        {props.children}
        <div className="font-body pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover/toggle-button:opacity-100 bg-black text-white text-xs p-2 rounded-md shadow-lg z-[9999]">
          <span>{isActive ? "Remove link" : "Add link"}</span>
        </div>
      </button>

      {showLinkForm && (
        <form
          onPointerDown={stopBlur}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-editor-400 p-1.5 ring-1 ring-inset ring-gray-300 rounded-md dark:ring-editor-200 flex items-center gap-x-1.5 h-8 shadow-md z-[9999]"
          onSubmit={onSubmit}
        >
          <input
            className="text-xs focus:outline-none px-1 py-0.5 border-0 rounded-sm ring-1 ring-gray-200 focus:ring-1 focus:ring-gray-300 placeholder-gray-300 w-48"
            placeholder="Enter a link and press Enter"
            ref={inputRef}
            onChange={e => setUrl(e.target.value)}
            value={url}
          />
          <button
            type="submit"
            className="bg-primary-100 hover:bg-primary h-full px-2 ring-1 ring-primary-400 rounded-sm"
          >
            <CheckIcon className="h-4 w-4 text-gray-600" />
          </button>
        </form>
      )}
    </div>
  );
};

const FormattingToolbar = ({ editor }: { editor: Editor }) => {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  return (
    <div className="bg-white dark:bg-editor-400 text-gray-600 py-1 text-xs flex divide-x divide-border-secondary dark:divide-border-tertiary w-fit">
      <div className="flex gap-x-1 items-center justify-center px-1">
        <NodeTypeDropdown
          editor={editor}
          open={openMenu === "node-type"}
          onToggle={() =>
            setOpenMenu(prev => (prev === "node-type" ? null : "node-type"))
          }
          onClose={() => setOpenMenu(null)}
        />
      </div>

      <div className="flex gap-x-1 items-center justify-center px-1">
        <ToggleFormattingButton
          name="Bold"
          shortcut="⌘+b"
          type="bold"
          onToggle={() => editor.chain().focus().toggleBold().run()}
          editor={editor}
        >
          <strong>B</strong>
        </ToggleFormattingButton>
        <ToggleFormattingButton
          name="Italic"
          shortcut="⌘+i"
          type="italic"
          onToggle={() => editor.chain().focus().toggleItalic().run()}
          editor={editor}
        >
          <em className="italic">i</em>
        </ToggleFormattingButton>
        <ToggleFormattingButton
          name="Underline"
          shortcut="⌘+u"
          type="underline"
          onToggle={() => editor.commands.toggleUnderline()}
          editor={editor}
        >
          <u className="underline">U</u>
        </ToggleFormattingButton>
        <ToggleFormattingButton
          name="Strikethrough"
          shortcut="⌘+⇧+x"
          type="strike"
          onToggle={() => editor.chain().focus().toggleStrike().run()}
          editor={editor}
        >
          <s className="line-through">S</s>
        </ToggleFormattingButton>
        <ColorTextButton
          editor={editor}
          open={openMenu === "color"}
          onToggle={() =>
            setOpenMenu(prev => (prev === "color" ? null : "color"))
          }
          onClose={() => setOpenMenu(null)}
        />
      </div>

      <div className="flex gap-x-1 items-center justify-center px-1">
        <AddLinkButton
          onLink={url => editor.chain().setLink({ href: url }).run()}
          onUnlink={() => editor.chain().focus().unsetLink().run()}
          editor={editor}
        >
          <LinkIcon className="h-4 w-4" />
        </AddLinkButton>
        <AddImageButton editor={editor} />
      </div>
    </div>
  );
};

export default FormattingToolbar;
