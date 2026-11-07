import { getPreviewClientKind } from "@/lib/preview/cookies";
import { sectionCountsMockData } from "@/_mockdata/sections";

import type { SectionCounts } from "./types";

export async function getSectionCounts(): Promise<SectionCounts> {
  return sectionCountsMockData[await getPreviewClientKind()];
}
