import type { BlockTag, Kpi, OverviewBlock, OverviewData } from "@/types";

export function findBlock<Tag extends BlockTag>(
  blocks: readonly OverviewBlock[],
  tag: Tag
): Extract<OverviewBlock, { _tag: Tag }> | undefined {
  return blocks.find(
    (block): block is Extract<OverviewBlock, { _tag: Tag }> =>
      block._tag === tag
  );
}

// The key numbers come from the database; the rest of the Overview is still
// the client type's preview content. With no numbers yet, the preview ones stay.
export function withKpis(
  data: OverviewData,
  kpis: readonly Kpi[]
): OverviewData {
  return {
    ...data,
    blocks: data.blocks.map(block =>
      block._tag === "kpis" && kpis.length > 0
        ? { ...block, items: kpis }
        : block
    ),
  };
}
