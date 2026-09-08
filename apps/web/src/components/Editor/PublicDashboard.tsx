import type * as Y from "yjs";
import { useRef } from "react";
import { List } from "immutable";
import type { ExecutionQueue, AITasks } from "@sandworm/editor";

import type { ApiDocument, APIDataSource } from "@/types";

import type { APIDataSources } from "./hooks/useDataSources";
import { EditorAwarenessProvider } from "./hooks/useEditorAwareness";
import { PublicSQLExtensionProvider } from "./blocks/customBlocks/CodeEditor/sql";
import DashboardView from "./blocks/Dashboard/DashboardView";

// Same no-op stubs PublicEditor uses — blocks check isPublicMode before
// calling anything on these, but still need non-null references.
const NOOP_EXECUTION_QUEUE = {
  getCurrentBatch: () => null,
  advance: () => {},
  enqueueBlock: () => {},
  enqueueBlockOnwards: () => {},
  enqueueBlockGroup: () => {},
  enqueueRunAll: () => {},
  getBlockExecutions: () => [],
  observe: () => () => {},
  toJSON: () => [],
  getRunAllBatches: () => [],
  getExecutionQueueMetadataForBlock: () => null,
  length: 0,
} as unknown as ExecutionQueue;

const NOOP_AI_TASKS = {
  enqueue: () => {},
  next: () => null,
  getBlockTasks: () => [],
  observe: () => () => {},
  size: () => 0,
} as unknown as AITasks;

const EMPTY_DATA_SOURCES: APIDataSources = List<APIDataSource>();

export interface PublicDashboardProps {
  document: ApiDocument;
  yDoc: Y.Doc;
}

export default function PublicDashboard(props: PublicDashboardProps) {
  const scrollViewRef = useRef<HTMLDivElement>(null);

  return (
    <EditorAwarenessProvider scrollViewRef={scrollViewRef} yDoc={props.yDoc}>
      <PublicSQLExtensionProvider>
        <DashboardView
          className="flex-1 min-h-0 h-full"
          document={props.document}
          dataSources={EMPTY_DATA_SOURCES}
          yDoc={props.yDoc}
          draggingBlock={null}
          latestBlockId={null}
          isEditing={false}
          userRole="viewer"
          userId={null}
          executionQueue={NOOP_EXECUTION_QUEUE}
          aiTasks={NOOP_AI_TASKS}
          onExpand={() => {}}
          isPublicMode
        />
      </PublicSQLExtensionProvider>
    </EditorAwarenessProvider>
  );
}
