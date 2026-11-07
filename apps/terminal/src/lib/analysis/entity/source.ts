import { getPreviewClientKind } from "@/lib/preview/cookies";
import {
  entityFixtures,
  findEntityPage,
} from "@/_mockdata/analysis/entity/index";

import type { EntityKind, EntityPage } from "./types";

export async function getEntityPage(
  kind: EntityKind,
  slug: string
): Promise<EntityPage | undefined> {
  const pages = entityFixtures[await getPreviewClientKind()];

  return findEntityPage(pages, kind, slug);
}
