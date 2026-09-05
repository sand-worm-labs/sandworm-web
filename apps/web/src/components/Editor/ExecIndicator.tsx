import type * as Y from "yjs";
import { PiCheck, PiClock, PiWarning } from "react-icons/pi";
import type { ExecutionQueue, TabRef, YBlock } from "@sandworm/editor";
import { getResultStatus } from "@sandworm/editor";
import { head } from "ramda";

import Spin from "./blocks/Spin";
import { useBlockExecutions } from "./hooks/useBlockExecution";

interface Props {
  tabRef: TabRef;
  blocks: Y.Map<YBlock>;
  executionQueue: ExecutionQueue;
}
function ExecIndicator(props: Props) {
  const block = props.blocks.get(props.tabRef.blockId);
  const result = block ? getResultStatus(block, props.blocks) : "idle";
  const executions = useBlockExecutions(props.executionQueue, block);
  const execution = head(executions);
  const status = execution?.item.getStatus()._tag ?? "idle";

  switch (status) {
    case "enqueued":
      return <PiClock className="h-3 w-3" />;
    case "aborting":
    case "running":
      return <Spin />;
    case "idle":
    case "completed":
    case "unknown":
      switch (result) {
        case "idle":
          return null;
        case "error":
          return <PiWarning className="h-3 w-3 text-error" />;
        case "success":
          return <PiCheck className="h-3 w-3 text-primary" />;
        default:
          return null;
      }
    default:
      return null;
  }
}

export default ExecIndicator;
