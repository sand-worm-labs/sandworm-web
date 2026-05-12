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
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
}


// =====================================
// ⬢ useBlockEditor
// =====================================
const useBlockEditor = ({ content, isEditable, setTitle }: UseBlockEditorArgs) => {
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

        // ── Markdown paste/copy ────────────────────────────────────────────
        //   Must come AFTER all content extensions so the serializer/parser
        //   can see every registered node type. Order matters here.
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
  const id      = props.block.getAttribute("id")!;
  const content = props.block.getAttribute("content")!;

  const setTitle = useCallback(
    (title: string) => { props.block.setAttribute("title", title); },
    [props.block]
  );

  const [, editorAPI] = useEditorAwareness();

  const { editor } = useBlockEditor({ content, setTitle, isEditable: props.isEditable });

  useEffect(() => {
    if (editor && props.isCursorInserting && props.isCursorWithin) {
      editor.commands.focus();
    }
  }, [editor, props.isCursorInserting, props.isCursorWithin]);

  useEffect(() => {
    if (!editor) return () => {};

    const onFocus = () => editorAPI.insert(id, { scrollIntoView: false });
    const onBlur  = () => editorAPI.blur();

    editor.on("focus", onFocus);
    editor.on("blur",  onBlur);

    return () => {
      editor.off("focus", onFocus);
      editor.off("blur",  onBlur);
    };
  }, [editor, id, editorAPI.insert, editorAPI.blur]);

  const ringColor = (() => {
    if (editor?.isFocused && !props.belongsToMultiTabGroup && props.isEditable)
      return "border border-border-focus dark:border-border-tertiary";

    if (!editor?.isFocused && !props.belongsToMultiTabGroup && props.isEditable
        && props.isCursorWithin && !props.isCursorInserting)
      return "border border-border-tertiary";

    if (props.dashboardMode?._tag === "editing" && props.dashboardMode.position === "expanded")
      return "border border-border-focus";

    return "";
  })();

  return (
    <div
      data-testid={`RichTextBlock-${id}`}
      ref={d => { props.dragPreview?.(d); }}
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
              props.belongsToMultiTabGroup && props.isCursorWithin && !props.isCursorInserting,
            "rounded-lg": !props.belongsToMultiTabGroup,
          }
        )}
      >
        <div
          role="toolbar"
          aria-label="Text formatting tools"
          onMouseDown={e => console.log("toolbar mousedown — target:", e.target)}
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

        <div className={clsx(props.dashboardMode ? "px-4 py-4 h-full overflow-y-auto" : "p-2 px-5")}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default RichTextBlock;