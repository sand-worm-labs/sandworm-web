import { getPreviewClientKind } from "@/features/preview/cookies";

import { sectionCountsFixtures } from "./fixtures";
import type { SectionCounts } from "./types";

export async function getSectionCounts(): Promise<SectionCounts> {
  return sectionCountsFixtures[await getPreviewClientKind()];
}
