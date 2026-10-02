import { appendRichTextContent, BlockType, type RichTextBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import type { BlockDefinition } from './block-definition';
import { assertOnly, patchTitle } from './update';

export const richTextBlock: BlockDefinition = {
  kind: 'rich_text',
  type: BlockType.RichText,
  toSpec: ({ title, source }) => ({ type: BlockType.RichText, title, source }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('rich_text', patch, ['title', 'source']);
    patchTitle(block, patch);

    // Rich text is a tree of nodes, not a string, so it is rebuilt from the
    // new text the same way it was built when the cell was created.
    if (patch.source !== undefined) {
      const content = (block as Y.XmlElement<RichTextBlock>).getAttribute('content');
      if (!content) return;
      content.delete(0, content.length);
      appendRichTextContent(content, patch.source);
    }
  },
};
