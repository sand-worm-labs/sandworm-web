import { range, sortWith, ascend } from "ramda";
import type * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";
import GridLayout from "react-grid-layout";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type {
  ExecutionQueue,
  AITasks,
  YBlock,
  DashboardChrome,
} from "@sandworm/editor";
import {
  getBlocks,
  getDashboard,
  yDashboardToGridLayout,
  getDashboardItem,
  addDashboardItemToYDashboard,
  mergeGridLayoutIntoYDashboard,
  setDashboardItemChrome,
  BlockType,
  removeDashboardBlock,
  dashboardCellSize,
  getDefaults,
  getMins,
  DASHBOARD_COLUMNS as COLS_COUNT,
  DASHBOARD_MARGIN as MARGIN,
} from "@sandworm/editor";
import { useResizeDetector } from "react-resize-detector";

import type { ApiDocument } from "@/types";

import type { APIDataSources } from "../../hooks/useDataSources";
import { useYDocState } from "../../hooks/useYDocs";
import Title from "../../Title";

// eslint-disable-next-line import/no-cycle
import GridElement from "./GridElement";
// eslint-disable-next-line import/no-cycle
import DashboardResultModal from "./DashboardResultModal";

import type { DraggingBlock } from ".";

// =====================================
// ⬢  Constants
// =====================================
const BREAKPOINTS = {
  lg: 800,
  sm: 0,
};

// When editing, the breakpoints should be the same
// to avoid repositioning of the blocks when showing/hiding
// the sidebar
const BREAKPOINT_EDIT_COLS: Record<keyof typeof BREAKPOINTS, number> = {
  lg: 24,
  sm: 24,
};

const BREAKPOINT_COLS: Record<keyof typeof BREAKPOINTS, number> = {
  lg: 24,
  sm: 1,
};

function generateBackground(
  cellWidth: number,
  cellHeight: number,
  gridWidth: number
): string {
  const rects = range(0, COLS_COUNT).map(i => {
    const x = i * (cellWidth + MARGIN) + MARGIN;
    return `<rect stroke="#f2f1f3" strokeWidth="2" fill="none" x="${x}" y="${MARGIN}" width="${cellWidth}" height="${cellHeight}" />`;
  });

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg"  width="${gridWidth}" height="${
      cellHeight + MARGIN
    }">`,
    ...rects,
    `</svg>`,
  ].join("");

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

interface InnerProps {
  width: number;
  yDoc: Y.Doc;
  dataSources: APIDataSources;
  document: ApiDocument;
  draggingBlock: DraggingBlock | null;
  userId: string | null;
  isEditing: boolean;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onExpand: (block: YBlock) => void;
  isPublicMode?: boolean;

  // We use this to trigger actions when a new block is added
  latestBlockId: string | null;
}

const WhiteCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-base-100 dark:bg-dropdown-bg rounded-2xl h-full border border-border dark:border-border-tertiary">
    {children}
  </div>
);

// A plain tile whose content is an HTML output (a profile card, a row of figures) is sized in
// whole grid rows, so it usually has blank space under it. In view mode it reports how tall
// its content really is, and the grid shortens the tile to fit.
const PlainCard = ({
  children,
  fitId,
  onFit,
}: {
  children: React.ReactNode;
  fitId?: string;
  onFit?: (id: string, px: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box || !fitId || !onFit) {
      return () => {};
    }

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Charts fill their tile on purpose; only HTML outputs are fitted.
        if (box.querySelector(".js-plotly-plot")) return;
        const frames = Array.from(box.querySelectorAll("iframe"));
        // An output that has not reported its height yet is hidden: wait for it.
        if (
          frames.length === 0 ||
          frames.some(f => f.style.visibility === "hidden")
        )
          return;
        const bottom = Math.max(
          ...frames.map(f => f.getBoundingClientRect().bottom)
        );
        const needed = bottom - box.getBoundingClientRect().top;
        if (needed > 0) onFit(fitId, needed);
      });
    };

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(box, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [fitId, onFit]);

  return (
    <div ref={ref} className="h-full">
      {children}
    </div>
  );
};

const TransparentCard = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-sm h-[calc(100%-4px)] outline outline-4 outline-offset-0  outline-border-tertiary">
    {children}
  </div>
);

function DashboardViewInner(props: InnerProps) {
  // The block whose result the camera button opened in a modal (view mode only).
  const [viewing, setViewing] = useState<YBlock | null>(null);
  const closeViewing = useCallback(() => setViewing(null), []);
  const { state: blocks } = useYDocState(props.yDoc, getBlocks);
  const { state: dashboard } = useYDocState(props.yDoc, getDashboard);

  const layout = useMemo(
    () =>
      sortWith(
        [ascend(item => item.y), ascend(item => item.x)],
        yDashboardToGridLayout(dashboard.value)
      ),
    [dashboard]
  );

  const onLayoutChange = useCallback(
    (_layout: GridLayout.Layout[], allLayouts: GridLayout.Layouts) => {
      // Viewing never saves: the heights a view fits to its content are not the author's.
      if (!props.isEditing) return;
      // eslint-disable-next-line dot-notation
      mergeGridLayoutIntoYDashboard(dashboard.value, allLayouts["lg"] ?? []);
    },
    [dashboard, props.isEditing]
  );

  const onSetChrome = useCallback(
    (id: string, chrome: DashboardChrome) => {
      setDashboardItemChrome(dashboard.value, id, chrome);
    },
    [dashboard]
  );

  const onDelete = useCallback(
    (id: string) => {
      dashboard.value.delete(id);
      const blockId = getDashboardItem(dashboard.value, id)?.blockId;
      if (!blockId) {
        return;
      }

      removeDashboardBlock(blocks.value, blockId);
    },
    [dashboard, blocks]
  );

  // How tall each plain tile's content is, in pixels, as the tiles report it.
  const [fit, setFit] = useState<Record<string, number>>({});
  const onFit = useCallback((id: string, px: number) => {
    setFit(prev =>
      Math.abs((prev[id] ?? -1) - px) < 1 ? prev : { ...prev, [id]: px }
    );
  }, []);

  const children = useMemo(
    () =>
      layout.map(item => {
        const dashItem = getDashboardItem(dashboard.value, item.i);

        const block = dashItem
          ? (blocks.value.get(dashItem.blockId) ?? null)
          : null;

        const type = block?.getAttribute("type");

        const hasTransparentCard = type
          ? [
              BlockType.Input,
              BlockType.DropdownInput,
              BlockType.DateInput,
              BlockType.DashboardHeader,
            ].includes(type)
          : false;

        // While editing, a heading or an input keeps its outline so it can be found and
        // dragged. In view mode they sit on the page with no frame.
        let WrapperCard = hasTransparentCard ? TransparentCard : WhiteCard;
        if (hasTransparentCard && !props.isEditing) {
          WrapperCard = PlainCard;
        }
        // A plain tile has no card: the cell's own output sits on the page.
        // While editing it keeps a faint outline so it can still be found.
        if (dashItem?.chrome === "plain") {
          WrapperCard = props.isEditing ? TransparentCard : PlainCard;
        }

        const element = (
          <GridElement
            chrome={dashItem?.chrome}
            onSetChrome={props.isEditing ? onSetChrome : undefined}
            block={block}
            onDelete={onDelete}
            yDoc={props.yDoc}
            document={props.document}
            dataSources={props.dataSources}
            item={item}
            isEditingDashboard={props.isEditing}
            latestBlockId={props.latestBlockId}
            userId={props.userId}
            executionQueue={props.executionQueue}
            aiTasks={props.aiTasks}
            onExpand={props.onExpand}
            onViewResult={props.isEditing ? undefined : setViewing}
            isPublicMode={props.isPublicMode}
          />
        );

        return (
          <div key={item.i} data-block-type={type}>
            {WrapperCard === PlainCard ? (
              <PlainCard fitId={item.i} onFit={onFit}>
                {element}
              </PlainCard>
            ) : (
              <WrapperCard>{element}</WrapperCard>
            )}
          </div>
        );
      }),
    [
      dashboard,
      blocks,
      onDelete,
      onSetChrome,
      props.yDoc,
      props.document,
      props.dataSources,
      props.isEditing,
      layout,
      props.userId,
      props.executionQueue,
      props.isPublicMode,
      onFit,
    ]
  );

  const [colsCount, setColsCount] = useState(BREAKPOINT_COLS.lg);
  const onBreakpointChange = useCallback(
    (_newBreakpoint: string, newCols: number) => {
      setColsCount(newCols);
    },
    []
  );

  const { cellWidth, cellHeight } = useMemo(() => {
    return dashboardCellSize(props.width, colsCount);
  }, [props.width, colsCount]);

  const onDrop = useCallback(
    (_layout: GridLayout.Layout[], item: GridLayout.Layout, e: DragEvent) => {
      const blockId = e.dataTransfer?.getData("text/plain");
      if (!blockId) {
        return;
      }

      const id = uuidv4();
      addDashboardItemToYDashboard(dashboard.value, {
        id,
        blockId,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        ...(props.draggingBlock ? getMins(props.draggingBlock.type) : {}),
      });
    },
    [dashboard, props.draggingBlock]
  );

  // In view mode a plain tile is as tall as its content needs, rounded up to whole rows, and
  // the tiles under it move up. Phones show one column of full-width rows: left alone.
  const fittedLayout = useMemo(() => {
    if (props.isEditing || colsCount !== COLS_COUNT) return layout;
    return layout.map(item => {
      const px = fit[item.i];
      if (px === undefined) return item;
      const rows = Math.max(
        1,
        Math.ceil((px + MARGIN) / (cellHeight + MARGIN))
      );
      return rows < item.h
        ? { ...item, h: rows, minH: Math.min(item.minH ?? rows, rows) }
        : item;
    });
  }, [layout, fit, cellHeight, colsCount, props.isEditing]);

  const style = useMemo(
    () => ({
      minHeight: 1280,
      background: generateBackground(cellWidth, cellHeight, props.width),
    }),
    [cellWidth, props.width]
  );

  const onDropDragOver = useCallback(() => {
    const size = { w: 8, h: 6 };

    if (props.draggingBlock) {
      const mins = getDefaults(props.draggingBlock.type);
      size.w = Math.max(
        Math.ceil(props.draggingBlock.width / cellWidth),
        mins.minW
      );
      size.h = Math.max(
        Math.ceil(props.draggingBlock.height / cellHeight),
        mins.minH
      );
    }

    return size;
  }, [cellWidth, props.draggingBlock]);

  const ResponsiveGridLayout = GridLayout.Responsive as any;

  return (
    <>
      <ResponsiveGridLayout
        rowHeight={cellHeight}
        width={props.width}
        layouts={{ lg: fittedLayout }}
        margin={[MARGIN, MARGIN]}
        onLayoutChange={onLayoutChange}
        breakpoints={BREAKPOINTS}
        cols={props.isEditing ? BREAKPOINT_EDIT_COLS : BREAKPOINT_COLS}
        onBreakpointChange={onBreakpointChange}
        isDraggable={props.isEditing}
        isDroppable={props.isEditing}
        isResizable={props.isEditing}
        resizeHandles={["sw", "se"]}
        onDrop={onDrop}
        onDropDragOver={onDropDragOver}
        style={props.isEditing ? style : {}}
      >
        {children}
      </ResponsiveGridLayout>
      <DashboardResultModal
        block={viewing}
        onClose={closeViewing}
        yDoc={props.yDoc}
        document={props.document}
        dataSources={props.dataSources}
        userId={props.userId}
        executionQueue={props.executionQueue}
        aiTasks={props.aiTasks}
        isPublicMode={props.isPublicMode ?? false}
      />
    </>
  );
}

interface Props {
  className?: string;
  yDoc: Y.Doc;
  dataSources: APIDataSources;
  document: ApiDocument;
  draggingBlock: DraggingBlock | null;
  isEditing: boolean;
  latestBlockId: string | null;
  userRole: string;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  onExpand: (block: YBlock) => void;
  isPublicMode?: boolean;
  // Drawn inside another page: it takes the height of its content instead of scrolling
  // on its own, and leaves the title to the page around it.
  embedded?: boolean;
}
export default function DashboardView(props: Props) {
  const { width, ref } = useResizeDetector();

  return (
    <div
      id="dashboard-wrapper"
      data-dashboard-ready="true"
      className={clsx(
        "min-h-0 overflow-x-hidden font-body",
        props.embedded ? "h-auto" : "h-full overflow-y-auto px-8 py-6 lg:px-16",
        props.className
      )}
    >
      <div className={props.embedded ? undefined : "pb-8 px-1"}>
        {!props.embedded && (
          <Title
            // eslint-disable-next-line react/style-prop-object
            style="font-weight: medium; font-size: 2.5rem;"
            content={props.yDoc.getXmlFragment("title")}
            isLoading={false}
            isEditable={props.isEditing && props.userRole !== "viewer"}
          />
        )}
        <div ref={ref} className={props.embedded ? undefined : "mt-6"}>
          {width ? <DashboardViewInner {...props} width={width} /> : <div />}
        </div>
      </div>
    </div>
  );
}
