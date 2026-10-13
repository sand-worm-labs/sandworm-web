// What a notebook's finding is made of: the cells' code, data sources and parameters.
// Outputs are left out on purpose. Row counts and values move as the data does, so
// the receipt commits to the inputs and anyone can re-run them.

import {
  getBlocks,
  getDateInputAttributes,
  getDropdownInputAttributes,
  getInputAttributes,
  getLayout,
  getPythonAttributes,
  getSQLAttributes,
  switchBlockType,
  type YBlock,
} from '@sandworm/editor';
import type * as Y from 'yjs';

import { hashCanonical, normalizeText, type Json } from './canonical.ts';

// =====================================
// ⬢ Types
// =====================================
export type CellInput = { cellId: string; kind: string } & { [key: string]: Json };

// =====================================
// ⬢ Reading cells
// =====================================
// A block attribute as plain JSON: collaborative text becomes a string, and a
// { value } wrapper is unwrapped. Checked by shape, because the editor and this
// package may each load their own copy of Yjs.
function plain(value: unknown): Json {
  if (value && typeof value === 'object' && 'toDelta' in value) return String(value);
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
    return plain((value as { value: unknown }).value);
  }
  return JSON.parse(JSON.stringify(value ?? null)) as Json;
}

function describe(block: YBlock, blocks: Y.Map<YBlock>): { [key: string]: Json } | null {
  return switchBlockType<{ [key: string]: Json } | null>(block, {
    onSQL: b => {
      const attrs = getSQLAttributes(b, blocks);
      return {
        kind: 'sql',
        source: normalizeText(attrs.source.toString()),
        dataSource: attrs.dataSourceId ?? null,
        dataframe: attrs.dataframeName.value,
      };
    },
    onPython: b => ({ kind: 'python', source: normalizeText(getPythonAttributes(b).source.toString()) }),
    onInput: b => {
      const attrs = getInputAttributes(b, blocks);
      return { kind: 'input', label: plain(attrs.label), variable: plain(attrs.variable), value: plain(attrs.value) };
    },
    onDropdownInput: b => {
      const attrs = getDropdownInputAttributes(b, blocks);
      return {
        kind: 'dropdown_input',
        label: plain(attrs.label),
        variable: plain(attrs.variable),
        value: plain(attrs.value),
        options: plain(attrs.options),
      };
    },
    onDateInput: b => {
      const attrs = getDateInputAttributes(b, blocks);
      return {
        kind: 'date_input',
        label: plain(attrs.label),
        variable: plain(attrs.variable),
        value: plain(attrs.value),
        dateType: plain(attrs.dateType),
      };
    },
    // Text, charts and tables do not produce the finding.
    onRichText: () => null,
    onMarkdown: () => null,
    onVisualization: () => null,
    onVisualizationV2: () => null,
    onPivotTable: () => null,
    onPowerToolbox: () => null,
    onJavaScript: () => null,
    onFileUpload: () => null,
    onDashboardHeader: () => null,
  });
}

// Every cell that holds code or parameters, in notebook order: what a notebook is
// made of, and so what a receipt must cover for the notebook to count as attested.
export function runnableCellIds(ydoc: Y.Doc): string[] {
  const blocks = getBlocks(ydoc);
  const layout = getLayout(ydoc);
  const order = layout.toArray().flatMap(group => {
    const tabs = group.getAttribute('tabs') as Y.Array<Y.XmlElement> | undefined;
    return tabs ? tabs.toArray().map(ref => String(ref.getAttribute('id'))) : [];
  });
  const known = order.filter(id => blocks.has(id));
  const rest = [...blocks.keys()].filter(id => !known.includes(id));
  return [...known, ...rest].filter(id => describe(blocks.get(id)!, blocks) !== null);
}

// The chosen cells, in the order of `cellIds`. A cell that is missing, or that
// holds no inputs, is an error: a receipt must not silently cover less than it says.
export function extractInputs(ydoc: Y.Doc, cellIds: string[]): CellInput[] {
  const blocks = getBlocks(ydoc);
  return cellIds.map(cellId => {
    const block = blocks.get(cellId);
    if (!block) throw new Error(`No cell ${cellId} in this notebook`);
    const input = describe(block, blocks);
    if (!input) throw new Error(`Cell ${cellId} has no code or parameters to attest`);
    return { cellId, ...input } as CellInput;
  });
}

// The code and parameters alone: what must still be in the notebook for it to be "the same".
export const hashCode = (inputs: CellInput[]) => hashCanonical(inputs as unknown as Json);

// The code plus when it ran. Output changes as the data does; the run time says which
// moment's data the finding came from, so a later difference in results is explained
// by time and not by someone altering the inputs.
export const hashInputs = (inputs: CellInput[], ranAt: string) =>
  hashCanonical({ cells: inputs as unknown as Json, ranAt });

// A notebook whose cells have never run: nothing says which data the finding came from.
export class NotRunError extends Error {
  constructor() {
    super('None of these cells has run yet: run the notebook, then build the receipt');
    this.name = 'NotRunError';
  }
}

// =====================================
// ⬢ When it ran
// =====================================
// The latest run among the chosen cells, as an ISO time. A cell that never ran has
// no time, and a receipt without one would say nothing about which data it saw.
export function ranAt(ydoc: Y.Doc, cellIds: string[]): string {
  const blocks = getBlocks(ydoc);
  const times = cellIds.flatMap(cellId => {
    const block = blocks.get(cellId);
    if (!block) return [];
    const time = switchBlockType<string | null>(block, {
      onSQL: b => getSQLAttributes(b, blocks).lastQueryTime,
      onPython: b => getPythonAttributes(b).lastQueryTime ?? null,
      onInput: () => null,
      onDropdownInput: () => null,
      onDateInput: () => null,
      onRichText: () => null,
      onMarkdown: () => null,
      onVisualization: () => null,
      onVisualizationV2: () => null,
      onPivotTable: () => null,
      onPowerToolbox: () => null,
      onJavaScript: () => null,
      onFileUpload: () => null,
      onDashboardHeader: () => null,
    });
    const parsed = time ? new Date(time) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? [parsed.getTime()] : [];
  });
  if (times.length === 0) throw new NotRunError();
  return new Date(Math.max(...times)).toISOString();
}
