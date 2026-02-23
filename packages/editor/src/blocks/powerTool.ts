import * as Y from "yjs";
import {
  BlockType,
  BaseBlock,
  YBlock,
  getAttributeOr,
  getBaseAttributes,
  duplicateBaseAttributes,
} from "./index.js";
import { ExecutionStatus } from "../execution/item.js";

export type PowerToolboxBlock = BaseBlock<BlockType.PowerToolbox> & {
  // The selected tool from the catalog, e.g. "staking.validator_apy"
  toolId: string | null;

  // Denormalized from catalog for display without loading the full catalog
  toolLabel: string | null;
  toolCategory: string | null;

  // User-configured input values, keyed by the input.key from the catalog
  // Using Y.Map so individual input changes are granular CRDT ops
  inputs: Y.Map<unknown>;

  // Last execution result snapshot (not collaborative — overwritten on each run)
  outputSnapshot: Y.Map<unknown>;
};

export const isPowerToolboxBlock = (
  block: YBlock
): block is Y.XmlElement<PowerToolboxBlock> => {
  return block.getAttribute("type") === BlockType.PowerToolbox;
};

export const makePowerToolboxBlock = (
  id: string
): Y.XmlElement<PowerToolboxBlock> => {
  const yBlock = new Y.XmlElement<PowerToolboxBlock>("block");

  const attrs: PowerToolboxBlock = {
    id,
    index: null,
    title: "",
    type: BlockType.PowerToolbox,
    toolId: null,
    toolLabel: null,
    toolCategory: null,
    inputs: new Y.Map(),
    outputSnapshot: new Y.Map(),
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};

export function getPowerToolboxAttributes(
  block: Y.XmlElement<PowerToolboxBlock>
): PowerToolboxBlock {
  return {
    ...getBaseAttributes(block),
    toolId: getAttributeOr(block, "toolId", null),
    toolLabel: getAttributeOr(block, "toolLabel", null),
    toolCategory: getAttributeOr(block, "toolCategory", null),
    inputs: getAttributeOr(block, "inputs", new Y.Map()),
    outputSnapshot: getAttributeOr(block, "outputSnapshot", new Y.Map()),
  };
}

export function duplicatePowerToolboxBlock(
  newId: string,
  block: Y.XmlElement<PowerToolboxBlock>
): Y.XmlElement<PowerToolboxBlock> {
  const prevAttrs = getPowerToolboxAttributes(block);

  // Deep-copy the inputs map so the duplicate is independent
  const newInputs = new Y.Map<unknown>();
  prevAttrs.inputs.forEach((value, key) => {
    newInputs.set(key, value);
  });

  const newAttrs: PowerToolboxBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    toolId: prevAttrs.toolId,
    toolLabel: prevAttrs.toolLabel,
    toolCategory: prevAttrs.toolCategory,
    inputs: newInputs,
    outputSnapshot: new Y.Map(),
  };

  const yBlock = new Y.XmlElement<PowerToolboxBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}

export function getPowerToolboxBlockExecStatus(
  block: Y.XmlElement<PowerToolboxBlock>
): ExecutionStatus {
  const attrs = getPowerToolboxAttributes(block);

  if (!attrs.toolId) {
    return "idle";
  }

  return "completed";
}