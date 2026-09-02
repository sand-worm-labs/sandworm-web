import Youtube from "@tiptap/extension-youtube";
import type * as Y from "yjs";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import MathExtension from "@aarkue/tiptap-math-extension";
import { getRichTextAttributes, type RichTextBlock } from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDragPreview } from "react-dnd";
import { PiTrash } from "react-icons/pi";

import "katex/dist/katex.min.css";
import { TextIcon } from "@/components/Assets/Blocks/TextIcon";

import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";
import { BlockTypePill } from "../../BlockTypePill";

import ImageExtension from "./ImageExtension";
import FormattingToolbar from "./FormattingToolbar";
import { MarkdownExtension } from "./MarkdownExtention";

// =====================================
// ⬢ Types
// =====================================
interface UseBlockEditorArgs {
  content: Y.XmlFragment;
  isEditable: boolean;
  setTitle: (title: string) => void;
}

interface Props {
  block: Y.XmlElement<RichTextBlock>;
  belongsToMultiTabGroup: boolean;
  isEditable: boolean;
  isPublicMode?: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
  onDeleteBlock: () => void;
}

// =====================================
// ⬢ useBlockEditor
// =====================================
const useBlockEditor = ({
  content,
  isEditable,
  setTitle,
}: UseBlockEditorArgs) => {
  const [isSpellcheckEnabled] = useState(false);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      autofocus: false,
      editable: isEditable,
      extensions: [
        TaskList,
        TaskItem.configure({ nested: true }),

        StarterKit.configure({
          undoRedo: false,
          dropcursor: false,
        }),

        Collaboration.configure({ fragment: content }),

        Underline.configure({
          HTMLAttributes: { class: "my-custom-class" },
        }),
        TextStyleKit,
        Color.configure({ types: ["textStyle"] }),
        Highlight.configure({ multicolor: true }),

        Link.extend({ inclusive: false }).configure({
          HTMLAttributes: {
            class: "cursor-pointer text-ink-400 hover:text-gray-700",
            target: "_blank",
          },
        }),
        ImageExtension.configure({ inline: true, allowBase64: true }),
        Youtube.configure({ inline: true }),

        MathExtension.configure({ evaluation: false }),

        MarkdownExtension,

        Placeholder.configure({
          placeholder: "Click here to start adding content.",
        }),
        Extension.create({
          name: "sandwormKeyboardShortcuts",
          addKeyboardShortcuts: () => ({
            Escape: args => {
              args.editor.commands.blur();
              return true;
            },
          }),
        }),
      ],

      onUpdate({ editor: currentEditor }) {
        const editorJson = currentEditor.getJSON()?.content;
        const firstNode = editorJson?.[0]?.content?.[0];
        const firstLineContent =
          firstNode && "text" in firstNode ? (firstNode.text as string) : "";
        setTitle(firstLineContent);
      },

      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: isSpellcheckEnabled ? "true" : "false",
          class:
            "min-h-full prose sm:prose-base prose-sm max-w-full rounded-sm focus:outline-0 whitespace-pre-wrap ph-no-capture font-body sandworm-prose",
        },
      },
    },
    [content]
  );

  useEffect(
    () => () => {
      editor?.destroy();
      try {
        // @ts-ignore — internal y-undo undo manager must be destroyed manually
        const undoManager = editor?.state["y-undo$"]?.undoManager;
        if (undoManager) {
          undoManager.destroy();
          undoManager.restore = null;
        }
      } catch (e) {
        console.error("Failed to destroy collaboration undo manager", e);
      }
    },
    [editor]
  );

  return { editor };
};

// =====================================
// ⬢ Main RichText Block
// =====================================
const RichTextBlock = (props: Props) => {
  const id = props.block.getAttribute("id")!;
  // getAttribute("content") can read back null for a block still being
  // integrated (e.g. tab-hidden blocks reconnecting) — Tiptap's
  // Collaboration extension crashes on a falsy fragment (falls back to
  // `this.options.document.getXmlFragment(...)`, and document is never
  // set here), so fall back to a fresh fragment rather than pass null.
  const content = getRichTextAttributes(props.block).content;

  const setTitle = useCallback(
    (title: string) => {
      props.block.setAttribute("title", title);
    },
    [props.block]
  );

  const [, editorAPI] = useEditorAwareness();

  const { editor } = useBlockEditor({
    content,
    setTitle,
    isEditable: props.isEditable,
  });

  useEffect(() => {
    if (editor && props.isCursorInserting && props.isCursorWithin) {
      editor.commands.focus();
    }
  }, [editor, props.isCursorInserting, props.isCursorWithin]);

  useEffect(() => {
    if (!editor) return () => {};

    const onFocus = () => editorAPI.insert(id, { scrollIntoView: false });
    const onBlur = () => editorAPI.blur();

    editor.on("focus", onFocus);
    editor.on("blur", onBlur);

    return () => {
      editor.off("focus", onFocus);
      editor.off("blur", onBlur);
    };
  }, [editor, id, editorAPI.insert, editorAPI.blur]);

  return (
    <div
      data-testid={`RichTextBlock-${id}`}
      data-block-id={id}
      className="relative group/block mt-6"
    >
      <div
        ref={d => {
          props.dragPreview?.(d);
        }}
        className={clsx(
          "rounded-2xl",
          props.dashboardMode ? "h-full overflow-y-auto" : "",
          props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
          props.isPublicMode
            ? ""
            : clsx("border-[1.5px]", {
                "border-primary block-focus-ring":
                  props.isCursorWithin && props.isCursorInserting,
                "border-hover-border dark:border-border-dark shadow-none":
                  props.isCursorWithin && !props.isCursorInserting,
                "border-hover-border block-shadow-soft dark:border-border-dark":
                  !props.isCursorWithin,
              })
        )}
      >
        <div
          role="toolbar"
          aria-label="Text formatting tools"
          onMouseDown={e =>
            console.log("toolbar mousedown — target:", e.target)
          }
          className={clsx(
            "overflow-visible transition-all duration-150 ease-out",
            editor?.isFocused ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {editor && (
            <div className="border-b border-border-secondary dark:border-border-dark px-2 py-1">
              <FormattingToolbar editor={editor} />
            </div>
          )}
        </div>

        <div
          className={clsx(
            props.isPublicMode
              ? "p-0"
              : props.dashboardMode
                ? "px-4 py-4 h-full overflow-y-auto"
                : "p-2 px-5"
          )}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {!props.isPublicMode && (
        <div className="absolute left-0 top-0 -translate-y-full pb-2">
          <BlockTypePill label="Text" icon={<TextIcon className="w-3 h-3" />} />
        </div>
      )}

      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          !props.isEditable ? "hidden" : "flex"
        )}
      >
        <button
          type="button"
          onClick={props.onDeleteBlock}
          aria-label="Delete block"
          className="bg-[#FFDBDB] dark:bg-header-surface dark:border dark:border-hover-border rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
        >
          <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default RichTextBlock;
