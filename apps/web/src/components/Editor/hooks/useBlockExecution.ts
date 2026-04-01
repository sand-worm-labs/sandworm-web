import type {
  Execution,
  ExecutionQueue,
  ExecutionQueueItemMetadataWithoutNoop,
  YBlock,
} from "@sandworm/editor";
import { getBaseAttributes } from "@sandworm/editor";
import { useEffect, useState } from "react";

// =====================================
// ⬢ Use Block Executions
// =====================================
export function useBlockExecutions(
  queue: ExecutionQueue,
  block?: YBlock,
  tag?: ExecutionQueueItemMetadataWithoutNoop["_tag"]
): Execution[] {
  const blockId = block ? getBaseAttributes(block).id : "";
  const [executions, setExecutions] = useState(
    queue.getBlockExecutions(blockId, tag)
  );

  useEffect(() => {
    const clean = queue.observe(() => {
      setExecutions(queue.getBlockExecutions(blockId, tag));
    });

    return clean;
  }, [queue, blockId, tag]);

  return executions;
}
