import type {
  AITaskItem,
  AITaskItemMetadataWithoutNoop,
  AITasks,
  YBlock,
} from "@sandworm/editor";
import { getBaseAttributes } from "@sandworm/editor";
import { useEffect, useState } from "react";

import {
  useEditTitleWithAiMutation,
  useEditPythonWithAiMutation,
  useEditSqlWithAiMutation,
  useFixSqlWithAiMutation,
  useFixPythonWithAiMutation,
  useEditTextWithAiMutation,
} from "@/generated/graphql";

// =====================================
// ⬢ useAITasks
// =====================================

export function useAITasks(
  aiTasks: AITasks,
  block?: YBlock,
  tag?: AITaskItemMetadataWithoutNoop["_tag"]
): AITaskItem[] {
  const blockId = block ? getBaseAttributes(block).id : "";
  const [tasks, setTasks] = useState(() => aiTasks.getBlockTasks(blockId, tag));

  useEffect(() => {
    const clean = aiTasks.observe(() => {
      setTasks(aiTasks.getBlockTasks(blockId, tag));
    });

    return clean;
  }, [aiTasks, blockId, tag]);

  return tasks;
}
// =====================================
// ⬢ Types
// =====================================

type BlockAIParams = {
  workspaceId: string;
  documentId: string;
  blockId: string;
  modelId: string;
};

type FixAiResult = {
  result: string;
  chatId: string;
};

type UseAITaskActions = {
  editTitleWithAi: (workspaceId: string, documentId: string) => Promise<void>;
  editSqlWithAi: (params: BlockAIParams) => Promise<string | null>;
  editPythonWithAi: (params: BlockAIParams) => Promise<string | null>;
  editTextWithAi: (params: BlockAIParams) => Promise<string | null>;
  fixSqlWithAi: (params: BlockAIParams) => Promise<FixAiResult | null>;
  fixPythonWithAi: (params: BlockAIParams) => Promise<FixAiResult | null>;
  loading: {
    title: boolean;
    sql: boolean;
    python: boolean;
    text: boolean;
    fixSql: boolean;
    fixPython: boolean;
  };
};

// =====================================
// ⬢ useAITaskActions
// =====================================

export function useAITaskActions(): UseAITaskActions {
  const [editTitleWithAiMutation, { loading: titleLoading }] =
    useEditTitleWithAiMutation();
  const [editSqlWithAiMutation, { loading: sqlLoading }] =
    useEditSqlWithAiMutation();
  const [editPythonWithAiMutation, { loading: pythonLoading }] =
    useEditPythonWithAiMutation();
  const [fixSqlWithAiMutation, { loading: fixSqlLoading }] =
    useFixSqlWithAiMutation();
  const [fixPythonWithAiMutation, { loading: fixPythonLoading }] =
    useFixPythonWithAiMutation();
  const [editTextWithAiMutation, { loading: textLoading }] =
    useEditTextWithAiMutation();

  async function editTitleWithAi(workspaceId: string, documentId: string) {
    await editTitleWithAiMutation({ variables: { workspaceId, documentId } });
  }

  async function editSqlWithAi(params: BlockAIParams): Promise<string | null> {
    const result = await editSqlWithAiMutation({ variables: params });
    return result.data?.editSqlWithAi ?? null;
  }

  async function editPythonWithAi(
    params: BlockAIParams
  ): Promise<string | null> {
    const result = await editPythonWithAiMutation({ variables: params });
    return result.data?.editPythonWithAi ?? null;
  }

  async function fixSqlWithAi(
    params: BlockAIParams
  ): Promise<FixAiResult | null> {
    const result = await fixSqlWithAiMutation({ variables: params });
    return result.data?.fixSqlWithAi ?? null;
  }

  async function fixPythonWithAi(
    params: BlockAIParams
  ): Promise<FixAiResult | null> {
    const result = await fixPythonWithAiMutation({ variables: params });
    return result.data?.fixPythonWithAi ?? null;
  }

  async function editTextWithAi(params: BlockAIParams): Promise<string | null> {
    const result = await editTextWithAiMutation({ variables: params });
    return result.data?.editTextWithAi ?? null;
  }

  return {
    editTitleWithAi,
    editSqlWithAi,
    editPythonWithAi,
    editTextWithAi,
    fixSqlWithAi,
    fixPythonWithAi,
    loading: {
      title: titleLoading,
      sql: sqlLoading,
      python: pythonLoading,
      text: textLoading,
      fixSql: fixSqlLoading,
      fixPython: fixPythonLoading,
    },
  };
}
