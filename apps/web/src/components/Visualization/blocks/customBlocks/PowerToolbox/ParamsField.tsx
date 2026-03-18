"use client";

import type { ParamDefinition, ParamType } from "@sandworm/editor";

import { AddressField } from "./fields/AddressField";
import { AddressListField } from "./fields/AddressListField";
import { SelectField, ChainMultiSelect } from "./fields/SelectField";
import { TextField, NumberField } from "./fields/TextNumberField";
import { DateRangeField, type DateRange } from "./fields/DateRangeField";

// ─── Field value types ────────────────────────────────────────────────────────

/**
 * The union of all possible field value shapes.
 * Each field component receives its specific type — this union is used
 * by the form to hold all param values in a single map.
 */
export type FieldValue = string | number | boolean | string[] | DateRange;

// ─── Field registry ───────────────────────────────────────────────────────────

/**
 * Registry maps a ParamType to a render function.
 *
 * To add a new param type:
 *  1. Add the type to `ParamType` in types.ts
 *  2. Build the field component
 *  3. Add an entry here — nothing else needs to change.
 */
type FieldRenderer = (props: {
  param: ParamDefinition;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
}) => React.ReactElement | null;

const FIELD_REGISTRY: Record<ParamType, FieldRenderer> = {
  address: ({ param, value, onChange, error }) => (
    <AddressField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  token_address: ({ param, value, onChange, error }) => (
    <AddressField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  schema_uid: ({ param, value, onChange, error }) => (
    <AddressField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  "address[]": ({ param, value, onChange, error }) => (
    <AddressListField
      param={param}
      value={value as string[]}
      onChange={onChange as (v: string[]) => void}
      error={error}
    />
  ),

  chain: ({ param, value, onChange, error }) => (
    <SelectField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  select: ({ param, value, onChange, error }) => (
    <SelectField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  "chain[]": ({ param, value, onChange, error }) => (
    <ChainMultiSelect
      param={param}
      value={value as string[]}
      onChange={onChange as (v: string[]) => void}
      error={error}
    />
  ),

  text: ({ param, value, onChange, error }) => (
    <TextField
      param={param}
      value={value as string}
      onChange={onChange as (v: string) => void}
      error={error}
    />
  ),

  number: ({ param, value, onChange, error }) => (
    <NumberField
      param={param}
      value={value as number}
      onChange={onChange as (v: number) => void}
      error={error}
    />
  ),

  date_range: ({ param, value, onChange, error }) => (
    <DateRangeField
      param={param}
      value={(value as DateRange) ?? { from: "", to: "" }}
      onChange={onChange as (v: DateRange) => void}
      error={error}
    />
  ),
};

// ─── ParamField ───────────────────────────────────────────────────────────────

interface ParamFieldProps {
  param: ParamDefinition;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
}

/**
 * Looks up the correct field renderer from the registry and renders it.
 * Falls back to a plain text field for any unregistered types so the form
 * never breaks on unknown future types.
 */
export function ParamField({ param, value, onChange, error }: ParamFieldProps) {
  const renderer = FIELD_REGISTRY[param.type];

  if (!renderer) {
    console.warn(
      `[ParamField] No renderer registered for type "${param.type}". Falling back to text.`
    );
    return (
      <TextField
        param={param}
        value={value as string}
        onChange={onChange as (v: string) => void}
        error={error}
      />
    );
  }

  return renderer({ param, value, onChange, error });
}
