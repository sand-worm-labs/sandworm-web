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
import type { RichTextBlock } from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import type { ConnectDragPreview } from "react-dnd";

import "katex/dist/katex.min.css";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";

import ImageExtension from "./ImageExtension";
import FormattingToolbar from "./FormattingToolbar";

const useBlockEditor = ({
  content,
  isEditable,
  setTitle,
}: {
  content: Y.XmlFragment;
  isEditable: boolean;
  setTitle: (title: string) => void;
}) => {
  const [isSpellcheckEnabled] = useState(false);
  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      autofocus: false,
      editable: isEditable,
      extensions: [
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        StarterKit.configure({
          history: false,
          dropcursor: false,
        }),
        Underline.configure({
          HTMLAttributes: {
            class: "my-custom-class",
          },
        }),
        Collaboration.configure({
          fragment: content,
        }),
        Placeholder.configure({
          placeholder: "Click here to start adding content.",
        }),
        Link.extend({ inclusive: false }).configure({
          HTMLAttributes: {
            class: "cursor-pointer text-ink-400  hover:text-gray-700",
            target: "_blank",
          },
        }),
        TextStyleKit,
        Color.configure({
          types: ["textStyle"],
        }),
        Highlight.configure({
          multicolor: true,
        }),
        ImageExtension.configure({
          inline: true,
          allowBase64: true,
        }),
        MathExtension.configure({
          evaluation: false,
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
        Youtube.configure({
          inline: true,
        }),
      ],
      onUpdate({ editor: currentEditor }) {
        const content = currentEditor.getJSON()?.content;
        const firstLineContent = content?.[0]?.content?.[0]?.text ?? "";
        setTitle(firstLineContent);
      },

      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: isSpellcheckEnabled ? "true" : "false",
          class:
            " min-h-full prose sm:prose-base prose-sm max-w-full rounded-sm focus:outline-0 whitespace-pre-wrap ph-no-capture font-body sandworm-prose",
        },
      },
    },
    [content]
  );

  useEffect(
    () => () => {
      editor?.destroy();

      // manually destroy collaboration undo manager
      try {
        // @ts-ignore
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

interface Props {
  block: Y.XmlElement<RichTextBlock>;
  belongsToMultiTabGroup: boolean;
  isEditable: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
}
const RichTextBlock = (props: Props) => {
  const id = props.block.getAttribute("id")!;
  const content = props.block.getAttribute("content")!;
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
    if (!editor) {
      return () => {};
    }

    const onFocus = () => {
      editorAPI.insert(id, { scrollIntoView: false });
    };
    editor.on("focus", onFocus);

    const onBlur = () => {
      editorAPI.blur();
    };
    editor.on("blur", onBlur);

    return () => {
      editor.off("focus", onFocus);
      editor.off("blur", onBlur);
    };
  }, [editor, id, editorAPI.insert, editorAPI.blur]);

  const ringColor =
    editor?.isFocused && !props.belongsToMultiTabGroup && props.isEditable
      ? " border border-border-focus dark:border-border-tertiary"
      : !editor?.isFocused &&
          !props.belongsToMultiTabGroup &&
          props.isEditable &&
          props.isCursorWithin &&
          !props.isCursorInserting
        ? " border border-border-tertiary "
        : props.dashboardMode?._tag === "editing" &&
            props.dashboardMode.position === "expanded"
          ? "border border-border-focus"
          : "";

  return (
    <div
      data-testid={`RichTextBlock-${id}`}
      ref={d => {
        props.dragPreview?.(d);
      }}
      data-block-id={id}
      className="flex flex-col"
    >
      <div
        className={clsx(
          "ring-border-focus ring-offset-4",
          props.dashboardMode ? "h-full overflow-y-auto" : "",
          ringColor,
          {
            "rounded-tl-none rounded-lg border border-border-tertiary":
              props.belongsToMultiTabGroup,
            "rounded-tl-none rounded-lg border border-border-secondary":
              props.belongsToMultiTabGroup &&
              props.isCursorWithin &&
              !props.isCursorInserting,
            "rounded-lg": !props.belongsToMultiTabGroup,
          }
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
            <div className="border-b border-border-secondary dark:border-border-tertiary px-2 py-1">
              <FormattingToolbar editor={editor} />
            </div>
          )}
        </div>

        <div
          className={clsx(
            props.dashboardMode
              ? "px-4 py-4 h-full overflow-y-auto"
              : "p-2 px-5"
          )}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default RichTextBlock;
