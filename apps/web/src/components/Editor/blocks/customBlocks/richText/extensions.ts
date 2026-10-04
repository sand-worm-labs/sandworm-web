import Youtube from "@tiptap/extension-youtube";
import { Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import MathExtension from "@aarkue/tiptap-math-extension";

import ImageExtension from "./ImageExtension";
import { createMarkdownExtension } from "./MarkdownExtention";

// =====================================
// ⬢ Types
// =====================================
interface RichTextExtensionsOptions {
  placeholder: string;
  undoRedo?: boolean;
  media?: boolean;
  html?: boolean;
}

// =====================================
// ⬢ Rich Text Extensions
// =====================================
export const richTextExtensions = ({
  placeholder,
  undoRedo = true,
  media = true,
  html = true,
}: RichTextExtensionsOptions) => [
  TaskList,
  TaskItem.configure({ nested: true }),
  StarterKit.configure({
    ...(undoRedo ? {} : { undoRedo: false }),
    dropcursor: false,
  }),
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
  ...(media
    ? [
        ImageExtension.configure({ inline: true, allowBase64: true }),
        Youtube.configure({ inline: true }),
      ]
    : []),
  MathExtension.configure({ evaluation: false }),
  createMarkdownExtension({ html }),
  Placeholder.configure({ placeholder }),
  Extension.create({
    name: "sandwormKeyboardShortcuts",
    addKeyboardShortcuts: () => ({
      Escape: args => {
        args.editor.commands.blur();
        return true;
      },
    }),
  }),
];
