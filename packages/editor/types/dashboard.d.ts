import GridLayout from 'react-grid-layout';
import * as Y from 'yjs';
import * as z from 'zod';
export declare const DashboardItem: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodLiteral<"DASHBOARD_ITEM">;
    blockId: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
    minW: z.ZodOptional<z.ZodNumber>;
    minH: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "DASHBOARD_ITEM";
    blockId: string;
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number | undefined;
    minH?: number | undefined;
}, {
    type: "DASHBOARD_ITEM";
    blockId: string;
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number | undefined;
    minH?: number | undefined;
}>;
export type DashboardItem = z.infer<typeof DashboardItem>;
export type YDashboardItem = Y.XmlElement<DashboardItem>;
export declare function addDashboardItemToYDashboard(dashboard: Y.Map<YDashboardItem>, item: Omit<DashboardItem, 'type'>): void;
export declare function yDashboardToGridLayout(dashboard: Y.Map<YDashboardItem>): GridLayout.Layout[];
export declare function dashboardItemsToGridLayout(dashboard: Record<string, DashboardItem>): GridLayout.Layout[];
export declare function getDashboardItem(dashboard: Y.Map<YDashboardItem>, id: string): DashboardItem | null;
export declare function updateYDashboardFromRecord(dashboard: Y.Map<YDashboardItem>, record: Record<string, DashboardItem>): void;
export declare function yDashboardToRecord(dashboard: Y.Map<YDashboardItem>): Record<string, DashboardItem>;
export declare function mergeGridLayoutIntoYDashboard(dashboard: Y.Map<YDashboardItem>, layout: GridLayout.Layout[]): void;
export declare function isBlockInDashboard(dashboard: Y.Map<YDashboardItem>, blockId: string): boolean;
export declare function removeBlocksFromDashboard(dashboard: Y.Map<YDashboardItem>, blockIds: string[]): void;
//# sourceMappingURL=dashboard.d.ts.map