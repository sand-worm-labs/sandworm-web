import * as Y from "yjs";
import { Output } from "@sandworm/types";
import {
  BlockType,
  BaseBlock,
  YBlock,
  getAttributeOr,
  getBaseAttributes,
  duplicateBaseAttributes,
} from "../index.js";
import { ResultStatus } from "../../index.js";
import { clone } from "ramda";

export type PowerToolboxInputs = Record<string, string | number | boolean | string[]>;

export type PowerToolboxBlock = BaseBlock<BlockType.PowerToolbox> & {
  toolId: string | null;

  toolLabel: string | null;
  toolCategory: string | null;
  inputs: PowerToolboxInputs;

  lastExecutedInputs: PowerToolboxInputs | null;

  generatedSource: string;

  result: Output[];

  startedAt: string;
  executedAt: string;
};

export const isPowerToolboxBlock = (
  block: YBlock
): block is Y.XmlElement<PowerToolboxBlock> => {
  return block.getAttribute("type") === BlockType.PowerToolbox;
};

export const makePowerToolboxBlock = (
  id: string,
  toolId: string | null = null,
  inputs: PowerToolboxInputs = {},
  isAiInput?: boolean
): Y.XmlElement<PowerToolboxBlock> => {
  const yBlock = new Y.XmlElement<PowerToolboxBlock>("block");

  const attrs: PowerToolboxBlock = {
    id,
    index: null,
    title: "",
    type: BlockType.PowerToolbox,
    toolId: toolId ,
    toolLabel: null,
    toolCategory: null,
    inputs: inputs,
    lastExecutedInputs: null,
    generatedSource: "",
    result: [],
    startedAt: "",
    executedAt: "",
    isAiInput: isAiInput ?? false,
    editWithAIPrompt: new Y.Text(),
    isEditWithAIPromptOpen: false,
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
    inputs: getAttributeOr(block, "inputs", {}),
    lastExecutedInputs: getAttributeOr(block, "lastExecutedInputs", null),
    generatedSource: getAttributeOr(block, "generatedSource", ""),
    result: getPowerToolboxResult(block),
    startedAt: getAttributeOr(block, "startedAt", ""),
    executedAt: getAttributeOr(block, "executedAt", ""),
  };
}

export function duplicatePowerToolboxBlock(
  newId: string,
  block: Y.XmlElement<PowerToolboxBlock>,
  options?: { noState?: boolean }
): Y.XmlElement<PowerToolboxBlock> {
  const prevAttrs = getPowerToolboxAttributes(block);

  const nextAttrs: PowerToolboxBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    toolId: prevAttrs.toolId,
    toolLabel: prevAttrs.toolLabel,
    toolCategory: prevAttrs.toolCategory,
    inputs: options?.noState ? {} : clone(prevAttrs.inputs),
    lastExecutedInputs: options?.noState ? null : clone(prevAttrs.lastExecutedInputs),
    generatedSource: options?.noState ? "" : prevAttrs.generatedSource,
    result: options?.noState ? [] : clone(prevAttrs.result),
    startedAt: options?.noState ? "" : prevAttrs.startedAt,
    executedAt: options?.noState ? "" : prevAttrs.executedAt,
  };

  const yBlock = new Y.XmlElement<PowerToolboxBlock>("block");
  for (const [key, value] of Object.entries(nextAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}

export function getPowerToolboxBlockResultStatus(
  block: Y.XmlElement<PowerToolboxBlock>
): ResultStatus {
  const executedAt = block.getAttribute("executedAt");
  if (!executedAt) {
    return "idle";
  }

  const result = block.getAttribute("result");
  if (!result) {
    return "idle";
  }

  const hasError = (result as Output[]).some(o => o.type === "error");
  return hasError ? "error" : "success";
}

export function getPowerToolboxResult(
  block: Y.XmlElement<PowerToolboxBlock>
): Output[] {
  return getAttributeOr(block, "result", []);
}

export function getPowerToolboxBlockExecutedAt(
  block: Y.XmlElement<PowerToolboxBlock>
): Date | null {
  const executedAt = getAttributeOr(block, "executedAt", "").trim();
  return executedAt === "" ? null : new Date(executedAt);
}

export function getPowerToolboxBlockIsDirty(
  block: Y.XmlElement<PowerToolboxBlock>
): boolean {
  const { inputs, lastExecutedInputs } = getPowerToolboxAttributes(block);
  return JSON.stringify(inputs) !== JSON.stringify(lastExecutedInputs);
}

export function getPowerToolboxBlockErrorMessage(
  block: Y.XmlElement<PowerToolboxBlock>
): string | null {
  const result = getPowerToolboxResult(block);
  const errorOutput = result.find(o => o.type === "error");
  if (errorOutput && errorOutput.type === "error") {
    return `${errorOutput.ename} - ${errorOutput.evalue}`;
  }
  return null;
}

export type {
  ParamType,
  UiHint,
  SelectOption,
  ParamDefinition,
  SupportedLanguage,
  GenerateResult,
  ToolDefinition,
  ToolCategory,
  ToolTemplate,
  TemplateMap,
  ResolvedParams,
} from "./types.js";

export {
  interpolate,
  timeWhere,
  protocolWhere,
  wrapSqlInPython,
  dfNameFromToolId,
  renderTool,
} from "./renderer.js";

export {
  OptionsRegistry,
  getAllTools,
  getAllCategories,
  getToolsByCategory,
  getToolById,
  getCategoryById,
  searchTools,
  getToolCount,
  getToolCountByCategory,
  renderToolById,
  registerTool,
  registerCategory,
  loadToolsFromApi,
  isToolsLoaded,
  loadCategoriesFromApi,
  isCategoriesLoaded,
} from "./registory.js";