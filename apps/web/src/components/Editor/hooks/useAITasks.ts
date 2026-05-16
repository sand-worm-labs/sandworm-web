import type {
  AITaskItem,
  AITaskItemMetadataWithoutNoop,
  AITasks,
  YBlock,
} from "@sandworm/editor";
import { getBaseAttributes } from "@sandworm/editor";
import { useEffect, useState } from "react";

import { useEditTitleWithAiMutation } from "@/generated/graphql";

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
// ⬢ useAITaskActions
// =====================================

type UseAITaskActions = {
  editTitleWithAi: (workspaceId: string, documentId: string) => Promise<void>;
  loading: boolean;
};

export function useAITaskActions(): UseAITaskActions {
  const [editTitleWithAiMutation, { loading }] = useEditTitleWithAiMutation();

  async function editTitleWithAi(workspaceId: string, documentId: string) {
    await editTitleWithAiMutation({ variables: { workspaceId, documentId } });
  }

  return { editTitleWithAi, loading };
}
