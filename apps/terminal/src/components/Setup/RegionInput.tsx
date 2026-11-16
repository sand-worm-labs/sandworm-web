"use client";

import { Suspense } from "react";
import Link from "next/link";
import { PiGlobe } from "react-icons/pi";
import {
  ComboboxChipInput,
  type ChipOption,
} from "@sandworm/ui/kit/form/combobox-chip-input";

import { FlagIcon } from "@/components/Subject/SubjectAvatar";
import { ROUTES } from "@/config/routes";
import { REGION_OPTIONS, toRegionId } from "@/lib/regions";

function RegionIcon({ id }: ChipOption) {
  if (/^\d{3}$/.test(id)) return <PiGlobe size={14} aria-hidden="true" />;
  if (!/^[A-Z]{2}$/.test(id)) return null;
  return (
    <span aria-hidden="true" className="size-4 overflow-hidden rounded-full">
      <Suspense>
        <FlagIcon code={id} />
      </Suspense>
    </span>
  );
}

type RegionInputProps = {
  label: string;
  values: readonly string[];
  onChange: (values: string[]) => void;
};

// Regions and countries to follow, picked from a list so each one is a place
// the research knows. Names typed in before the list are matched to it.
export function RegionInput({ label, values, onChange }: RegionInputProps) {
  return (
    <ComboboxChipInput
      label={label}
      values={values.map(toRegionId)}
      options={REGION_OPTIONS}
      onChange={onChange}
      renderIcon={RegionIcon}
      renderEmpty={query => (
        <Link
          href={`${ROUTES.newRequest.path}?${new URLSearchParams({ question: `Please add this place to what we track: ${query}` })}`}
          className="font-medium text-primary-700 hover:text-primary dark:text-primary-200"
        >
          Ask the Sandworm team to add it
        </Link>
      )}
    />
  );
}
