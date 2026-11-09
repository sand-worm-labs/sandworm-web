import { AnalysisViewKind } from "@sandworm/types/terminal";

import { isEnumValue } from "@/lib/enum";

// An entity page is one of the analysis views: a project, a region or a sector
export type EntityKind = AnalysisViewKind;

export const isEntityKind = isEnumValue(AnalysisViewKind);
