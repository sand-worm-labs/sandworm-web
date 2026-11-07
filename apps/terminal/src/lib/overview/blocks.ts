import type { BlockTag, OverviewBlock } from "@/types";

export function findBlock<Tag extends BlockTag>(
  blocks: readonly OverviewBlock[],
  tag: Tag
): Extract<OverviewBlock, { _tag: Tag }> | undefined {
  return blocks.find(
    (block): block is Extract<OverviewBlock, { _tag: Tag }> =>
      block._tag === tag
  );
}
