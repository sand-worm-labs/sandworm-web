/* eslint-disable react/no-unstable-nested-components */
import clsx from "clsx";
import type { ReactNode } from "react";
import { useCallback, useMemo, useRef } from "react";
import type * as Y from "yjs";
import type {
  YBlock,
  TabRef as TabRefT,
  YBlockGroup,
  ExecutionQueue,
  AITasks,
} from "@sandworm/editor";
import {
  getTabsFromBlockGroupId,
  switchBlockType,
  getPrettyTitle,
  getCurrentTabId,
  getTabsFromBlockGroup,
} from "@sandworm/editor";
import type { DataFrame } from "@sandworm/types";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import type { ApiDocument } from "@/types";

import VisualizationV2Block from "../Visualization";
import VisualizationBlock from "../Visualization";

import DateInputBlock from "./blocks/customBlocks/dateInput";
import DropdownInputBlock from "./blocks/customBlocks/dropdownInput";
import FileUploadBlock from "./blocks/customBlocks/fileUpload";
import InputBlock from "./blocks/customBlocks/input";
import PythonBlock from "./blocks/customBlocks/python";
import RichTextBlock from "./blocks/customBlocks/richText";
import AnalyticsBlock from "./blocks/customBlocks/PowerToolbox/AnalyticsBlock";
import SQLBlock from "./blocks/customBlocks/sql";
import { PublicSQLExtensionProvider } from "./blocks/customBlocks/CodeEditor/sql";
import PivotTableBlock from "./blocks/customBlocks/pivotTable";
import { useYDocState } from "./hooks/useYDocs";
import useEditorAwareness, {
  EditorAwarenessProvider,
} from "./hooks/useEditorAwareness";
import type { APIDataSources } from "./hooks/useDataSources";
import { ContentSkeleton } from "./ContentSkeleton";
import Title from "./Title";
import { publicWidthClasses } from "./constants";

import { getTabIcon } from ".";

// ─────────────────────────────────────────────────────────────
// ⬢ Y.DOC GETTERS
// ─────────────────────────────────────────────────────────────

const layoutGetter = (yDoc: Y.Doc) => yDoc.getArray<YBlockGroup>("layout");
const blocksGetter = (yDoc: Y.Doc) => yDoc.getMap<YBlock>("blocks");
const dataframesGetter = (yDoc: Y.Doc) => yDoc.getMap<DataFrame>("dataframes");

// ─────────────────────────────────────────────────────────────
// ⬢ NO-OP STUBS
// Individual blocks receive these — they check isPublicMode before
// calling anything, but they still need non-null references.
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// ⬢ TAB HEADER (read-only, no drag/drop/context menu)
// ─────────────────────────────────────────────────────────────

interface PublicTabProps {
  tabRef: TabRefT;
  onSwitchActiveTab: (tabId: string) => void;
  isFirst?: boolean;
}

function PublicTab({ tabRef, onSwitchActiveTab, isFirst }: PublicTabProps) {
  const Icon = getTabIcon(tabRef.type);

  return (
    <button
      type="button"
      onClick={() => onSwitchActiveTab(tabRef.blockId)}
      className={clsx(
        "flex gap-x-2 items-center border-l border-r border-t border-border-secondary px-2.5 py-1.5 rounded-t-sm whitespace-nowrap text-xs",
        tabRef.isCurrent
          ? "bg-white text-gray-950"
          : "bg-gray-50 text-ink-400 hover:bg-gray-100",
        !isFirst ? "-ml-[1px]" : ""
      )}
    >
      <Icon
        className={clsx(
          "h-3 w-3",
          tabRef.isCurrent ? "text-gray-600" : "text-gray-300"
        )}
      />
      {tabRef.title || getPrettyTitle(tabRef.type)}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ TAB CONTENT RENDERER
// Identical logic to TabRef in V2Editor — just strips cursor/
// insert mode flags that have no meaning in public view.
// ─────────────────────────────────────────────────────────────

interface PublicTabRefProps {
  blocks: Y.Map<YBlock>;
  tab: TabRefT;
  hasMultipleTabs: boolean;
  layout: Y.Array<YBlockGroup>;
  document: ApiDocument;
  dataSources: APIDataSources;
  dataframes: Y.Map<DataFrame>;
  isApp: boolean;
  currentBlockId: string | undefined;
  isPDF: boolean;
  isQueryView: boolean;
}

function PublicTabRef(props: PublicTabRefProps) {
  const [editorState] = useEditorAwareness();

  const blockData = props.blocks.get(props.tab.blockId);
  if (!blockData) return <div>Block not found</div>;

  // In public view these are always false — blocks use them to
  // gate focus rings / insert-mode styling, safe to stub out.
  const isCursorWithin = editorState.cursorBlockId === props.tab.blockId;
  const isCursorInserting = editorState.mode === "insert";

  const jsx = switchBlockType(blockData, {
    onRichText: block => (
      <RichTextBlock
        block={block}
        isEditable={false}
        belongsToMultiTabGroup={props.hasMultipleTabs}
        dragPreview={null}
        dashboardMode={null}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
      />
    ),
    onSQL: block => (
      <SQLBlock
        block={block}
        layout={props.layout}
        blocks={props.blocks}
        isPublicMode
        viewModeCodeHidden={!props.isQueryView}
        isEditable={false}
        document={props.document}
        dataSources={props.dataSources}
        dragPreview={null}
        dashboardMode={null}
        hasMultipleTabs={props.hasMultipleTabs}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        onSchemaExplorer={() => {}}
        insertBelow={() => {}}
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        aiTasks={NOOP_AI_TASKS}
        isFullScreen={false}
      />
    ),
    onPython: block => (
      <PythonBlock
        isPublicMode
        viewModeCodeHidden={!props.isQueryView}
        block={block}
        blocks={props.blocks}
        isEditable={false}
        document={props.document}
        dragPreview={null}
        isPDF={props.isPDF}
        dashboardMode={null}
        hasMultipleTabs={props.hasMultipleTabs}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        insertBelow={() => {}}
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        aiTasks={NOOP_AI_TASKS}
        isFullScreen={false}
      />
    ),
    onVisualization: block => (
      <VisualizationBlock
        isPublicMode
        isEditable={false}
        document={props.document}
        onAddGroupedBlock={() => {}}
        block={block}
        dashboardMode={null}
        blocks={props.blocks}
        dataframes={props.dataframes}
        dragPreview={null}
        hasMultipleTabs={props.hasMultipleTabs}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        isFullScreen={false}
      />
    ),
    onVisualizationV2: block => (
      <VisualizationV2Block
        isPublicMode
        isEditable={false}
        document={props.document}
        onAddGroupedBlock={() => {}}
        block={block}
        blocks={props.blocks}
        dataframes={props.dataframes}
        dragPreview={null}
        dashboardMode={null}
        hasMultipleTabs={props.hasMultipleTabs}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        isFullScreen={false}
      />
    ),
    onInput: block => (
      <InputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={props.hasMultipleTabs}
        isEditable={false}
        isApp={props.isApp}
        dashboardMode={null}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        workspaceId={props.document.workspaceId}
        executionQueue={NOOP_EXECUTION_QUEUE}
      />
    ),
    onDropdownInput: block => (
      <DropdownInputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={props.hasMultipleTabs}
        isEditable={false}
        isApp={props.isApp}
        dataframes={props.dataframes}
        dashboardMode={null}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        workspaceId={props.document.workspaceId}
        executionQueue={NOOP_EXECUTION_QUEUE}
      />
    ),
    onDateInput: block => (
      <DateInputBlock
        block={block}
        blocks={props.blocks}
        dragPreview={null}
        belongsToMultiTabGroup={props.hasMultipleTabs}
        isEditable={false}
        isApp={props.isApp}
        dashboardMode={null}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        workspaceId={props.document.workspaceId}
        executionQueue={NOOP_EXECUTION_QUEUE}
      />
    ),
    onFileUpload: block => (
      <FileUploadBlock
        block={block}
        workspaceId={props.document.workspaceId}
        documentId={props.document.id}
        isEditable={false}
        isPublicViewer
        dragPreview={null}
        hasMultipleTabs={props.hasMultipleTabs}
        onPythonUsage={() => {}}
        onQueryUsage={() => {}}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
      />
    ),
    onDashboardHeader: (): JSX.Element | null => null,
    onPivotTable: block => (
      <PivotTableBlock
        workspaceId={props.document.workspaceId}
        block={block}
        blocks={props.blocks}
        hasMultipleTabs={props.hasMultipleTabs}
        isEditable={false}
        onAddGroupedBlock={() => {}}
        dragPreview={null}
        dataframes={props.dataframes}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        dashboardMode={null}
        isCursorWithin={isCursorWithin}
        isCursorInserting={isCursorInserting}
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        isFullScreen={false}
      />
    ),
    onPowerToolbox: block => (
      <AnalyticsBlock
        block={block}
        blocks={props.blocks}
        isEditable={false}
        document={props.document}
        dragPreview={null}
        isPDF={props.isPDF}
        dashboardMode={null}
        hasMultipleTabs={props.hasMultipleTabs}
        isBlockHiddenInPublished={props.tab.isHiddenInPublished}
        onToggleIsBlockHiddenInPublished={() => {}}
        insertBelow={() => {}}
        isPublicMode
        userId={null}
        executionQueue={NOOP_EXECUTION_QUEUE}
        isFullScreen={false}
      />
    ),
  });

  return (
    <div
      key={props.tab.blockId}
      className={
        props.tab.blockId === props.currentBlockId || props.isPDF
          ? ""
          : "h-0 overflow-hidden"
      }
    >
      {jsx}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ TABBED BLOCK (no drag, no drop, no context menu)
// ─────────────────────────────────────────────────────────────

interface PublicTabbedBlockProps {
  id: string;
  document: ApiDocument;
  isApp: boolean;
  dataSources: APIDataSources;
  dataframes: Y.Map<DataFrame>;
  yDoc: Y.Doc;
  isPDF: boolean;
  isQueryView: boolean;
}

function PublicTabbedBlock(props: PublicTabbedBlockProps) {
  const { state: layout } = useYDocState<Y.Array<YBlockGroup>>(
    props.yDoc,
    layoutGetter
  );
  const { state: blocks } = useYDocState<Y.Map<YBlock>>(
    props.yDoc,
    blocksGetter
  );

  const tabRefs = useMemo(
    () =>
      getTabsFromBlockGroupId(layout.value, blocks.value, props.id).filter(t =>
        props.isApp ? !t.isHiddenInPublished : true
      ),
    [props.id, layout, blocks, props.isApp]
  );

  const hasMultipleTabs = tabRefs.length > 1;

  const currentBlockId = useMemo(
    () => getCurrentTabId(layout.value, props.id, blocks.value, props.isApp),
    [layout, blocks, props.isApp, props.id]
  );

  // Tab switching still works — it's a Y.Doc transaction with no
  // socket dependency, same as in the full editor.
  const onSwitchActiveTab = useCallback(
    (tabId: string) => {
      props.yDoc.transact(() => {
        const { switchActiveTab } = require("@sandworm/editor");
        switchActiveTab(layout.value, props.id, tabId);
      });
    },
    [props.yDoc, layout.value, props.id]
  );

  if (tabRefs.length === 0) return null;

  return (
    <div className="flex-grow max-w-full">
      {hasMultipleTabs && !props.isPDF && (
        <div className="print:hidden flex overflow-x-auto no-scrollbar scroll-smooth">
          {tabRefs.map((tabRef, i) => (
            <PublicTab
              key={tabRef.blockId}
              tabRef={tabRef}
              isFirst={i === 0}
              onSwitchActiveTab={onSwitchActiveTab}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {props.isPDF ? (
          <div className="flex flex-col gap-y-10">
            {tabRefs.map(tab => (
              <PublicTabRef
                key={tab.blockId}
                blocks={blocks.value}
                tab={tab}
                hasMultipleTabs={hasMultipleTabs}
                layout={layout.value}
                document={props.document}
                dataSources={props.dataSources}
                dataframes={props.dataframes}
                isApp={props.isApp}
                currentBlockId={currentBlockId}
                isPDF={props.isPDF}
                isQueryView={props.isQueryView}
              />
            ))}
          </div>
        ) : (
          tabRefs.map(tab => (
            <PublicTabRef
              key={tab.blockId}
              blocks={blocks.value}
              tab={tab}
              hasMultipleTabs={hasMultipleTabs}
              layout={layout.value}
              document={props.document}
              dataSources={props.dataSources}
              dataframes={props.dataframes}
              isApp={props.isApp}
              currentBlockId={currentBlockId}
              isPDF={props.isPDF}
              isQueryView={props.isQueryView}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ INNER EDITOR (no hotkeys, no RunAll, no dialogs, no EnvBar)
// ─────────────────────────────────────────────────────────────

interface PublicEditorInnerProps {
  document: ApiDocument;
  dataSources: APIDataSources;
  isApp: boolean;
  isPDF: boolean;
  isFullScreen: boolean;
  yDoc: Y.Doc;
  isSyncing: boolean;
  isQueryView: boolean;
  scrollViewRef: React.MutableRefObject<HTMLDivElement | null>;
}

function PublicEditorInner(props: PublicEditorInnerProps) {
  const { state: layout } = useYDocState<Y.Array<YBlockGroup>>(
    props.yDoc,
    layoutGetter
  );
  const { state: blocks } = useYDocState<Y.Map<YBlock>>(
    props.yDoc,
    blocksGetter
  );
  const { state: dataframes } = useYDocState<Y.Map<DataFrame>>(
    props.yDoc,
    dataframesGetter
  );

  const domBlocks = useMemo(() => {
    return layout.value.toArray().map(blockGroup => {
      const blockId = blockGroup.getAttribute("id");
      const tabs = getTabsFromBlockGroup(blockGroup, blocks.value).filter(t =>
        props.isApp ? !t.isHiddenInPublished : true
      );

      if (!blockId || tabs.length === 0) return null;

      return (
        <PublicTabbedBlock
          key={blockId}
          id={blockId}
          document={props.document}
          isApp={props.isApp}
          dataSources={props.dataSources}
          dataframes={dataframes.value}
          yDoc={props.yDoc}
          isPDF={props.isPDF}
          isQueryView={props.isQueryView}
        />
      );
    });
  }, [
    layout,
    blocks,
    dataframes,
    props.document,
    props.isApp,
    props.dataSources,
    props.isPDF,
    props.yDoc,
    props.isQueryView,
  ]);

  return (
    <div className="editor-v2 flex flex-col flex-grow justify-center font-body subpixel-antialiased h-full w-full relative flex-1 min-w-0">
      <OverlayScrollbarsComponent
        id="editor-scrollview"
        element="div"
        options={{ scrollbars: { autoHide: "scroll" } }}
        events={{
          initialized: instance => {
            if (props.scrollViewRef) {
              props.scrollViewRef.current = instance.elements()
                .scrollEventElement as HTMLDivElement;
            }
          },
        }}
        className={clsx("h-full w-full", {
          "overflow-y-auto overflow-x-hidden px-5": !props.isPDF,
        })}
      >
        <div
          className={clsx(
            "flex justify-center w-full",
            props.isFullScreen ? "px-10" : "sm:px-0 px-4"
          )}
        >
          <div
            id="editor-wrapper"
            className={clsx(
              "flex-grow h-full py-2",
              props.isFullScreen ? "w-full" : publicWidthClasses
            )}
          >
            <div className={!props.isPDF ? "pt-12 pb-6" : ""}>
              <Title
                content={props.yDoc.getXmlFragment("title")}
                isLoading={props.isSyncing}
                isEditable={false}
              />
            </div>

            <ContentSkeleton visible={props.isSyncing} />

            {!props.isSyncing && (
              <div className="flex flex-col gap-y-12">{domBlocks}</div>
            )}

            {!props.isPDF && <div className="pb-20" />}
          </div>
        </div>
      </OverlayScrollbarsComponent>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ⬢ PUBLIC EDITOR — EXPORT
// Caller is responsible for hydrating yDoc before passing it in.
// No provider, no socket, no execution queue required.
//
// Minimal usage:
//   const doc = new Y.Doc()
//   Y.applyUpdate(doc, await fetchDocState(notebookId))
//   <PublicEditor yDoc={doc} document={...} dataSources={...} />
// ─────────────────────────────────────────────────────────────

export interface PublicEditorProps {
  document: ApiDocument;
  dataSources: APIDataSources;
  isApp: boolean;
  isPDF: boolean;
  isFullScreen: boolean;
  yDoc: Y.Doc;
  isSyncing: boolean;
  isQueryView?: boolean;
  children?: ReactNode;
}

export default function PublicEditor(props: PublicEditorProps) {
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const isQueryView = props.isQueryView ?? false;

  return (
    // EditorAwarenessProvider is kept because PublicTabRef calls
    // useEditorAwareness() for isCursorWithin/isCursorInserting.
    // Cost is negligible — it's just a context with no socket wiring.
    // The real SQLExtensionProvider needs an authenticated workspace
    // (useDataSources), which public viewers don't have — SQL blocks
    // still call useSQLExtension() on mount regardless of isEditable,
    // so a no-op PublicSQLExtensionProvider is required to avoid a
    // "Called getExtension outside of provider" crash.
    <EditorAwarenessProvider scrollViewRef={scrollViewRef} yDoc={props.yDoc}>
      <PublicSQLExtensionProvider>
        <PublicEditorInner
          {...props}
          isQueryView={isQueryView}
          scrollViewRef={scrollViewRef}
        />
        {props.children}
      </PublicSQLExtensionProvider>
    </EditorAwarenessProvider>
  );
}
