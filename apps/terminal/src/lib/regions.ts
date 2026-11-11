import { countries } from "country-flag-icons";
import type { ChipOption } from "@sandworm/ui/kit/form/combobox-chip-input";

// Flag sets list some places that are not countries
const NOT_COUNTRIES = new Set([
  "AC",
  "AQ",
  "BV",
  "CP",
  "DG",
  "EA",
  "EU",
  "GS",
  "HM",
  "IC",
  "SJ",
  "TA",
  "TF",
  "UM",
  "UN",
  "XA",
  "XC",
  "XO",
]);

// UN M49 continents, then the regions a client is likely to follow. Named here
// because browsers do not all know the names of these codes.
const CONTINENTS: Record<string, string> = {
  "002": "Africa",
  "019": "Americas",
  "142": "Asia",
  "150": "Europe",
  "009": "Oceania",
};
const REGIONS: Record<string, string> = {
  "419": "Latin America",
  "021": "Northern America",
  "202": "Sub-Saharan Africa",
  "015": "Northern Africa",
  "145": "Western Asia",
  "143": "Central Asia",
  "034": "Southern Asia",
  "035": "Southeast Asia",
  "030": "Eastern Asia",
};

// What people call a place that its official name does not say
const ALIASES: Record<string, string[]> = {
  AE: ["UAE", "Emirates"],
  CD: ["DRC", "DR Congo"],
  CI: ["Ivory Coast"],
  CV: ["Cabo Verde"],
  CZ: ["Czech Republic"],
  GB: ["UK", "Britain", "England"],
  HK: ["Hong Kong"],
  MK: ["Macedonia"],
  MM: ["Burma"],
  MO: ["Macau"],
  SZ: ["Swaziland"],
  TR: ["Turkey"],
  US: ["USA", "America"],
  VA: ["Holy See"],
};

const names = new Intl.DisplayNames(["en"], { type: "region" });

const toOption = (id: string, group: string, label?: string): ChipOption => ({
  id,
  label: label ?? names.of(id) ?? id,
  group,
  keywords: ALIASES[id]?.join(" "),
});
const byLabel = (a: ChipOption, b: ChipOption) =>
  a.label.localeCompare(b.label);

// Continents, regions, then countries, by ISO 3166 and UN M49 code
export const REGION_OPTIONS: readonly ChipOption[] = [
  ...Object.entries(CONTINENTS)
    .map(([id, name]) => toOption(id, "Continents", name))
    .sort(byLabel),
  ...Object.entries(REGIONS)
    .map(([id, name]) => toOption(id, "Regions", name))
    .sort(byLabel),
  ...countries
    .filter(code => /^[A-Z]{2}$/.test(code) && !NOT_COUNTRIES.has(code))
    .map(id => toOption(id, "Countries"))
    .sort(byLabel),
];

const IDS_BY_NAME = new Map(
  REGION_OPTIONS.flatMap(({ id, label }) => [
    [label.toLowerCase(), id],
    ...(ALIASES[id] ?? []).map(alias => [alias.toLowerCase(), id] as const),
  ])
);

// Regions were typed in before they were picked from a list: "Nigeria" is NG.
// A value that is neither a code nor a known name comes back as it was.
export function toRegionId(value: string): string {
  return IDS_BY_NAME.get(value.trim().toLowerCase()) ?? value;
}
