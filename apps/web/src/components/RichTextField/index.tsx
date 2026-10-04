"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import clsx from "clsx";
import { useEffect } from "react";
import { PiArrowArcLeft, PiArrowArcRight } from "react-icons/pi";

import "katex/dist/katex.min.css";
import FormattingToolbar from "@/components/Editor/blocks/customBlocks/richText/FormattingToolbar";
import { richTextExtensions } from "@/components/Editor/blocks/customBlocks/richText/extensions";
import { iconButtonSmClassName } from "@/styles/interactive";

// =====================================
// ⬢ Constants
// =====================================
const PROSE_CLASS =
  "prose sm:prose-base prose-sm max-w-full focus:outline-0 whitespace-pre-wrap font-body sandworm-prose";

const getMarkdown = (editor: Editor) =>
  (
    editor.storage as unknown as { markdown: { getMarkdown: () => string } }
  ).markdown.getMarkdown();

interface RichTextFieldProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
}

// =====================================
// ⬢ Rich Text Field
// =====================================
export const RichTextField = ({
  value,
  onChange,
  placeholder = "Start writing...",
  invalid = false,
  className,
}: RichTextFieldProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: richTextExtensions({ placeholder, media: false, html: false }),
    content: value,
    onUpdate: ({ editor: current }) => onChange(getMarkdown(current)),
    editorProps: {
      attributes: { class: clsx(PROSE_CLASS, "min-h-full px-5 py-4") },
    },
  });

  return (
    <div
      className={clsx(
        "flex flex-col rounded-xl border bg-inputBg dark:bg-base-400 overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent",
        invalid
          ? "border-red-500 dark:border-red-400"
          : "border-border dark:border-border-tertiary",
        className
      )}
    >
      {editor && (
        <div className="flex items-center divide-x divide-border-secondary dark:divide-border-tertiary border-b border-border-secondary dark:border-border-tertiary bg-white dark:bg-header-surface px-1">
          <div className="flex items-center gap-x-1 px-1">
            <button
              type="button"
              aria-label="Undo"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
              className={clsx(iconButtonSmClassName, "disabled:opacity-40")}
            >
              <PiArrowArcLeft size={14} />
            </button>
            <button
              type="button"
              aria-label="Redo"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
              className={clsx(iconButtonSmClassName, "disabled:opacity-40")}
            >
              <PiArrowArcRight size={14} />
            </button>
          </div>
          <FormattingToolbar editor={editor} showImage={false} />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent
          editor={editor}
          className="h-full [&>.ProseMirror]:h-full"
        />
      </div>
    </div>
  );
};

// =====================================
// ⬢ Rich Text View
// =====================================
export const RichTextView = ({ markdown }: { markdown: string }) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: richTextExtensions({
      placeholder: "",
      media: false,
      html: false,
    }),
    content: markdown,
    editorProps: { attributes: { class: PROSE_CLASS } },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && getMarkdown(editor) !== markdown) {
      editor.commands.setContent(markdown);
    }
  }, [editor, markdown]);

  return <EditorContent editor={editor} />;
};
