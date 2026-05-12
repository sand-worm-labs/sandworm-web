// =====================================
// ⬢ Imports
// =====================================
import { BsStars } from "react-icons/bs";
import type * as Y from "yjs";
import { EditorContent, useEditor } from "@tiptap/react";
import Collaboration from "@tiptap/extension-collaboration";
import Document from "@tiptap/extension-document";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { mergeAttributes, Node } from "@tiptap/core";
import clsx from "clsx";
import { useEffect } from "react";

import { TooltipV2 } from "@/components/Editor/blocks/ToolTips";

import { TitleSkeleton } from "./blocks/ContentSkeleton";

// =====================================
// ⬢ Types
// =====================================
interface TitleAIButtonProps {
  onClick: () => void;
  className?: string;
}

// =====================================
// ⬢ Component
// =====================================
export function TitleAIButton({ onClick, className }: TitleAIButtonProps) {
  return (
    <TooltipV2<HTMLButtonElement>
      title="Generate with AI"
      active
      position="bottom"
    >
      {ref => (
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          aria-label="Generate title with AI"
          className={[
            "flex items-center justify-center w-7 h-7",
            "rounded-full border border-[#B5C8DB]",
            "bg-white dark:bg-[#30302E]",
            "text-gray-500 dark:text-ink-400",
            "hover:text-violet-500 hover:border-violet-300",
            "dark:hover:border-violet-500/40 dark:hover:text-violet-400",
            "transition-all duration-150 shadow-sm",
            "opacity-0 group-hover:opacity-100",
            "translate-y-0.5 group-hover:translate-y-0",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <BsStars className="w-3.5 h-3.5" />
        </button>
      )}
    </TooltipV2>
  );
}

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export interface ITitleOptions {
  level: Level;
  HTMLAttributes: Record<string, any>;
}

export const TitleExtension = Node.create<ITitleOptions>({
  name: "doc-title",
  addOptions() {
    return {
      level: 1,
      onUpdate: () => {},
      HTMLAttributes: {},
    };
  },
  content: "text*",
  marks: "",
  group: "block",

  defining: true,

  addKeyboardShortcuts(this) {
    return {
      Enter: () => true,
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { level } = this.options;

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

interface Props {
  content: Y.XmlFragment;
  isEditable: boolean;
  isLoading: boolean;
  style?: string;
  onGenerateWithAI?: () => void;
}

function Title(props: Props) {
  const editor = useEditor(
    {
      autofocus: true,
      editable: props.isEditable,
      immediatelyRender: false,
      extensions: [
        Document,
        Text,
        TitleExtension.configure({
          level: 1,
          HTMLAttributes: {
            style: `font-weight: 900; font-size: 2.9rem; line-height: 1.1; ${props.style ?? ""}`,
            class: "font-body-condensed",
          },
        }),
        Placeholder.configure({
          placeholder: "Untitled Notebook",
          showOnlyWhenEditable: false,
        }),
        Collaboration.configure({
          fragment: props.content,
        }),
      ],
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false",
          class:
            "min-h-full prose sm:prose-base prose-sm max-w-full rounded-sm focus:outline-0 px-2 outline-none border-none ring-0",
        },
      },
    },
    [props.isEditable, props.style]
  );

  useEffect(
    () => () => {
      // cleanup after unmount
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

  useEffect(() => {
    const observer = () => {
      console.log("[Title ydoc] fragment changed:", props.content.toJSON());
    };
    props.content.observeDeep(observer);
    return () => props.content.unobserveDeep(observer);
  }, [props.content]);

  return (
    <div className="font-body">
      <TitleSkeleton visible={props.isLoading} />

      <div
        className={clsx(
          "group flex items-center gap-2",
          props.isLoading && "hidden"
        )}
      >
        <EditorContent editor={editor} className="flex-1" />

        {props.onGenerateWithAI && (
          <TitleAIButton onClick={props.onGenerateWithAI} />
        )}
      </div>
    </div>
  );
}

export default Title;
