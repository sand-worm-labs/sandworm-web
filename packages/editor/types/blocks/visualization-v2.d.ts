import { z } from "zod";
import * as Y from "yjs";
import { BlockType, BaseBlock, ResultStatus, YBlock } from "./index.js";
import { ChartType, DataFrame, DataFrameColumn, HistogramBin, HistogramFormat, TimeUnit, VisualizationFilter, YAxis, Series, DateFormat, NumberFormat } from "@sandworm/types";
export type VisualizationV2BlockInput = {
    dataframeName: string | null;
    chartType: ChartType;
    xAxis: DataFrameColumn | null;
    xAxisName: string | null;
    xAxisSort: "ascending" | "descending";
    xAxisGroupFunction: TimeUnit | null;
    xAxisDateFormat: DateFormat | null;
    xAxisNumberFormat: NumberFormat | null;
    yAxes: YAxis[];
    histogramFormat: HistogramFormat;
    histogramBin: HistogramBin;
    filters: VisualizationFilter[];
    dataLabels: {
        show: boolean;
        frequency: "all" | "some";
    };
};
export declare const DATE_FORMAT_OPTIONS: ({
    name: string;
    value: "MMMM d, yyyy";
} | {
    name: string;
    value: "d MMMM, yyyy";
} | {
    name: string;
    value: "EEEE, MMMM d, yyyy";
} | {
    name: string;
    value: "M/d/yyyy";
} | {
    name: string;
    value: "d/M/yyyy";
} | {
    name: string;
    value: "yyyy/M/d";
})[];
export declare const TIME_FORMAT_OPTIONS: ({
    name: string;
    value: "h:mm a";
} | {
    name: string;
    value: "HH:mm";
})[];
export declare const NUMBER_STYLE_OPTIONS: ({
    name: string;
    value: "normal";
} | {
    name: string;
    value: "percent";
} | {
    name: string;
    value: "scientific";
})[];
export declare const NUMBER_SEPARATOR_OPTIONS: ({
    name: string;
    value: "999,999.99";
} | {
    name: string;
    value: "999.999,99";
} | {
    name: string;
    value: "999 999,99";
} | {
    name: string;
    value: "999999.99";
})[];
declare const Serie: z.ZodUnion<[z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, "strip", z.ZodTypeAny, {
        position: "top" | "inside";
        show: boolean;
    }, {
        position: "top" | "inside";
        show: boolean;
    }>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        hideOverlap: boolean;
    }, {
        hideOverlap: boolean;
    }>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        x: string | number;
        y: string | number;
    }, {
        x: string | number;
        y: string | number;
    }>>;
} & {
    type: z.ZodLiteral<"bar">;
    stack: z.ZodOptional<z.ZodString>;
    barWidth: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "bar";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    stack?: string | undefined;
    barWidth?: string | undefined;
    color?: string | undefined;
}, {
    type: "bar";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    stack?: string | undefined;
    barWidth?: string | undefined;
    color?: string | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, "strip", z.ZodTypeAny, {
        position: "top" | "inside";
        show: boolean;
    }, {
        position: "top" | "inside";
        show: boolean;
    }>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        hideOverlap: boolean;
    }, {
        hideOverlap: boolean;
    }>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        x: string | number;
        y: string | number;
    }, {
        x: string | number;
        y: string | number;
    }>>;
} & {
    type: z.ZodLiteral<"scatter">;
    itemStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        color?: string | undefined;
    }, {
        color?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "scatter";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    itemStyle?: {
        color?: string | undefined;
    } | undefined;
}, {
    type: "scatter";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    itemStyle?: {
        color?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, "strip", z.ZodTypeAny, {
        position: "top" | "inside";
        show: boolean;
    }, {
        position: "top" | "inside";
        show: boolean;
    }>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        hideOverlap: boolean;
    }, {
        hideOverlap: boolean;
    }>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        x: string | number;
        y: string | number;
    }, {
        x: string | number;
        y: string | number;
    }>>;
} & {
    type: z.ZodLiteral<"line">;
    areaStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        color?: string | undefined;
    }, {
        color?: string | undefined;
    }>>;
    lineStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        color?: string | undefined;
    }, {
        color?: string | undefined;
    }>>;
    itemStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        color?: string | undefined;
    }, {
        color?: string | undefined;
    }>>;
    stack: z.ZodOptional<z.ZodString>;
    symbolSize: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "line";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    stack?: string | undefined;
    itemStyle?: {
        color?: string | undefined;
    } | undefined;
    areaStyle?: {
        color?: string | undefined;
    } | undefined;
    lineStyle?: {
        color?: string | undefined;
    } | undefined;
    symbolSize?: number | undefined;
}, {
    type: "line";
    id: string;
    datasetIndex: number;
    yAxisIndex: number;
    z: number;
    label?: {
        position: "top" | "inside";
        show: boolean;
    } | undefined;
    name?: string | number | undefined;
    labelLayout?: {
        hideOverlap: boolean;
    } | undefined;
    encode?: {
        x: string | number;
        y: string | number;
    } | undefined;
    stack?: string | undefined;
    itemStyle?: {
        color?: string | undefined;
    } | undefined;
    areaStyle?: {
        color?: string | undefined;
    } | undefined;
    lineStyle?: {
        color?: string | undefined;
    } | undefined;
    symbolSize?: number | undefined;
}>]>;
export type Serie = z.infer<typeof Serie>;
declare const XAxis: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nameLocation: z.ZodLiteral<"middle">;
    nameGap: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nameLocation: "middle";
    position?: "left" | "right" | "top" | "bottom" | undefined;
    name?: string | null | undefined;
    nameGap?: number | undefined;
}, {
    nameLocation: "middle";
    position?: "left" | "right" | "top" | "bottom" | undefined;
    name?: string | null | undefined;
    nameGap?: number | undefined;
}>, z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"value">;
    min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
    max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
}, "strip", z.ZodTypeAny, {
    type: "value";
    min?: number | "dataMin" | undefined;
    max?: number | "dataMax" | undefined;
}, {
    type: "value";
    min?: number | "dataMin" | undefined;
    max?: number | "dataMax" | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"category">;
}, "strip", z.ZodTypeAny, {
    type: "category";
}, {
    type: "category";
}>, z.ZodObject<{
    type: z.ZodLiteral<"time">;
    min: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "time";
    min?: string | undefined;
    max?: string | undefined;
}, {
    type: "time";
    min?: string | undefined;
    max?: string | undefined;
}>]>>, z.ZodObject<{
    axisPointer: z.ZodObject<{
        type: z.ZodLiteral<"shadow">;
    }, "strip", z.ZodTypeAny, {
        type: "shadow";
    }, {
        type: "shadow";
    }>;
}, "strip", z.ZodTypeAny, {
    axisPointer: {
        type: "shadow";
    };
}, {
    axisPointer: {
        type: "shadow";
    };
}>>;
export type XAxis = z.infer<typeof XAxis>;
declare const YAxis: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nameLocation: z.ZodLiteral<"middle">;
    nameGap: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nameLocation: "middle";
    position?: "left" | "right" | "top" | "bottom" | undefined;
    name?: string | null | undefined;
    nameGap?: number | undefined;
}, {
    nameLocation: "middle";
    position?: "left" | "right" | "top" | "bottom" | undefined;
    name?: string | null | undefined;
    nameGap?: number | undefined;
}>, z.ZodUnion<[z.ZodObject<{
    type: z.ZodLiteral<"value">;
    min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
    max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
}, "strip", z.ZodTypeAny, {
    type: "value";
    min?: number | "dataMin" | undefined;
    max?: number | "dataMax" | undefined;
}, {
    type: "value";
    min?: number | "dataMin" | undefined;
    max?: number | "dataMax" | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"category">;
}, "strip", z.ZodTypeAny, {
    type: "category";
}, {
    type: "category";
}>, z.ZodObject<{
    type: z.ZodLiteral<"time">;
    min: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "time";
    min?: string | undefined;
    max?: string | undefined;
}, {
    type: "time";
    min?: string | undefined;
    max?: string | undefined;
}>]>>, z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
}, "strip", z.ZodTypeAny, {
    position?: "left" | "right" | undefined;
}, {
    position?: "left" | "right" | undefined;
}>>;
export declare const VisualizationV2BlockOutputResult: z.ZodObject<{
    tooltip: z.ZodObject<{
        trigger: z.ZodLiteral<"axis">;
    }, "strip", z.ZodTypeAny, {
        trigger: "axis";
    }, {
        trigger: "axis";
    }>;
    legend: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    grid: z.ZodObject<{
        containLabel: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        containLabel: true;
    }, {
        containLabel: true;
    }>;
    dataset: z.ZodArray<z.ZodObject<{
        dimensions: z.ZodArray<z.ZodString, "many">;
        source: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>, "many">;
    }, "strip", z.ZodTypeAny, {
        source: Record<string, string | number>[];
        dimensions: string[];
    }, {
        source: Record<string, string | number>[];
        dimensions: string[];
    }>, "many">;
    xAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        nameLocation: z.ZodLiteral<"middle">;
        nameGap: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    }, {
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    }>, z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"value">;
        min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
        max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
    }, "strip", z.ZodTypeAny, {
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    }, {
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"category">;
    }, "strip", z.ZodTypeAny, {
        type: "category";
    }, {
        type: "category";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"time">;
        min: z.ZodOptional<z.ZodString>;
        max: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    }, {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    }>]>>, z.ZodObject<{
        axisPointer: z.ZodObject<{
            type: z.ZodLiteral<"shadow">;
        }, "strip", z.ZodTypeAny, {
            type: "shadow";
        }, {
            type: "shadow";
        }>;
    }, "strip", z.ZodTypeAny, {
        axisPointer: {
            type: "shadow";
        };
    }, {
        axisPointer: {
            type: "shadow";
        };
    }>>, "many">;
    yAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        nameLocation: z.ZodLiteral<"middle">;
        nameGap: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    }, {
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    }>, z.ZodUnion<[z.ZodObject<{
        type: z.ZodLiteral<"value">;
        min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
        max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
    }, "strip", z.ZodTypeAny, {
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    }, {
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"category">;
    }, "strip", z.ZodTypeAny, {
        type: "category";
    }, {
        type: "category";
    }>, z.ZodObject<{
        type: z.ZodLiteral<"time">;
        min: z.ZodOptional<z.ZodString>;
        max: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    }, {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    }>]>>, z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    }, "strip", z.ZodTypeAny, {
        position?: "left" | "right" | undefined;
    }, {
        position?: "left" | "right" | undefined;
    }>>, "many">;
    series: z.ZodArray<z.ZodUnion<[z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, "strip", z.ZodTypeAny, {
            position: "top" | "inside";
            show: boolean;
        }, {
            position: "top" | "inside";
            show: boolean;
        }>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            hideOverlap: boolean;
        }, {
            hideOverlap: boolean;
        }>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            x: string | number;
            y: string | number;
        }, {
            x: string | number;
            y: string | number;
        }>>;
    } & {
        type: z.ZodLiteral<"bar">;
        stack: z.ZodOptional<z.ZodString>;
        barWidth: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "bar";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        barWidth?: string | undefined;
        color?: string | undefined;
    }, {
        type: "bar";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        barWidth?: string | undefined;
        color?: string | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, "strip", z.ZodTypeAny, {
            position: "top" | "inside";
            show: boolean;
        }, {
            position: "top" | "inside";
            show: boolean;
        }>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            hideOverlap: boolean;
        }, {
            hideOverlap: boolean;
        }>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            x: string | number;
            y: string | number;
        }, {
            x: string | number;
            y: string | number;
        }>>;
    } & {
        type: z.ZodLiteral<"scatter">;
        itemStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            color?: string | undefined;
        }, {
            color?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "scatter";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
    }, {
        type: "scatter";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, "strip", z.ZodTypeAny, {
            position: "top" | "inside";
            show: boolean;
        }, {
            position: "top" | "inside";
            show: boolean;
        }>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            hideOverlap: boolean;
        }, {
            hideOverlap: boolean;
        }>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, "strip", z.ZodTypeAny, {
            x: string | number;
            y: string | number;
        }, {
            x: string | number;
            y: string | number;
        }>>;
    } & {
        type: z.ZodLiteral<"line">;
        areaStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            color?: string | undefined;
        }, {
            color?: string | undefined;
        }>>;
        lineStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            color?: string | undefined;
        }, {
            color?: string | undefined;
        }>>;
        itemStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            color?: string | undefined;
        }, {
            color?: string | undefined;
        }>>;
        stack: z.ZodOptional<z.ZodString>;
        symbolSize: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "line";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
        areaStyle?: {
            color?: string | undefined;
        } | undefined;
        lineStyle?: {
            color?: string | undefined;
        } | undefined;
        symbolSize?: number | undefined;
    }, {
        type: "line";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
        areaStyle?: {
            color?: string | undefined;
        } | undefined;
        lineStyle?: {
            color?: string | undefined;
        } | undefined;
        symbolSize?: number | undefined;
    }>]>, "many">;
}, "strip", z.ZodTypeAny, {
    tooltip: {
        trigger: "axis";
    };
    legend: {};
    grid: {
        containLabel: true;
    };
    dataset: {
        source: Record<string, string | number>[];
        dimensions: string[];
    }[];
    xAxis: (({
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    } & ({
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    } | {
        type: "category";
    } | {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    })) & {
        axisPointer: {
            type: "shadow";
        };
    })[];
    yAxis: (({
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    } & ({
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    } | {
        type: "category";
    } | {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    })) & {
        position?: "left" | "right" | undefined;
    })[];
    series: ({
        type: "bar";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        barWidth?: string | undefined;
        color?: string | undefined;
    } | {
        type: "scatter";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
    } | {
        type: "line";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
        areaStyle?: {
            color?: string | undefined;
        } | undefined;
        lineStyle?: {
            color?: string | undefined;
        } | undefined;
        symbolSize?: number | undefined;
    })[];
}, {
    tooltip: {
        trigger: "axis";
    };
    legend: {};
    grid: {
        containLabel: true;
    };
    dataset: {
        source: Record<string, string | number>[];
        dimensions: string[];
    }[];
    xAxis: (({
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    } & ({
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    } | {
        type: "category";
    } | {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    })) & {
        axisPointer: {
            type: "shadow";
        };
    })[];
    yAxis: (({
        nameLocation: "middle";
        position?: "left" | "right" | "top" | "bottom" | undefined;
        name?: string | null | undefined;
        nameGap?: number | undefined;
    } & ({
        type: "value";
        min?: number | "dataMin" | undefined;
        max?: number | "dataMax" | undefined;
    } | {
        type: "category";
    } | {
        type: "time";
        min?: string | undefined;
        max?: string | undefined;
    })) & {
        position?: "left" | "right" | undefined;
    })[];
    series: ({
        type: "bar";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        barWidth?: string | undefined;
        color?: string | undefined;
    } | {
        type: "scatter";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
    } | {
        type: "line";
        id: string;
        datasetIndex: number;
        yAxisIndex: number;
        z: number;
        label?: {
            position: "top" | "inside";
            show: boolean;
        } | undefined;
        name?: string | number | undefined;
        labelLayout?: {
            hideOverlap: boolean;
        } | undefined;
        encode?: {
            x: string | number;
            y: string | number;
        } | undefined;
        stack?: string | undefined;
        itemStyle?: {
            color?: string | undefined;
        } | undefined;
        areaStyle?: {
            color?: string | undefined;
        } | undefined;
        lineStyle?: {
            color?: string | undefined;
        } | undefined;
        symbolSize?: number | undefined;
    })[];
}>;
export type VisualizationV2BlockOutputResult = z.infer<typeof VisualizationV2BlockOutputResult>;
export declare const VisualizationV2BlockOutput: z.ZodObject<{
    executedAt: z.ZodString;
    tooManyDataPoints: z.ZodBoolean;
    result: z.ZodObject<{
        tooltip: z.ZodObject<{
            trigger: z.ZodLiteral<"axis">;
        }, "strip", z.ZodTypeAny, {
            trigger: "axis";
        }, {
            trigger: "axis";
        }>;
        legend: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
        grid: z.ZodObject<{
            containLabel: z.ZodLiteral<true>;
        }, "strip", z.ZodTypeAny, {
            containLabel: true;
        }, {
            containLabel: true;
        }>;
        dataset: z.ZodArray<z.ZodObject<{
            dimensions: z.ZodArray<z.ZodString, "many">;
            source: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>, "many">;
        }, "strip", z.ZodTypeAny, {
            source: Record<string, string | number>[];
            dimensions: string[];
        }, {
            source: Record<string, string | number>[];
            dimensions: string[];
        }>, "many">;
        xAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
            name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            nameLocation: z.ZodLiteral<"middle">;
            nameGap: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        }, {
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        }>, z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"value">;
            min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
            max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
        }, "strip", z.ZodTypeAny, {
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        }, {
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"category">;
        }, "strip", z.ZodTypeAny, {
            type: "category";
        }, {
            type: "category";
        }>, z.ZodObject<{
            type: z.ZodLiteral<"time">;
            min: z.ZodOptional<z.ZodString>;
            max: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        }, {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        }>]>>, z.ZodObject<{
            axisPointer: z.ZodObject<{
                type: z.ZodLiteral<"shadow">;
            }, "strip", z.ZodTypeAny, {
                type: "shadow";
            }, {
                type: "shadow";
            }>;
        }, "strip", z.ZodTypeAny, {
            axisPointer: {
                type: "shadow";
            };
        }, {
            axisPointer: {
                type: "shadow";
            };
        }>>, "many">;
        yAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
            name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            nameLocation: z.ZodLiteral<"middle">;
            nameGap: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        }, {
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        }>, z.ZodUnion<[z.ZodObject<{
            type: z.ZodLiteral<"value">;
            min: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
            max: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
        }, "strip", z.ZodTypeAny, {
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        }, {
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        }>, z.ZodObject<{
            type: z.ZodLiteral<"category">;
        }, "strip", z.ZodTypeAny, {
            type: "category";
        }, {
            type: "category";
        }>, z.ZodObject<{
            type: z.ZodLiteral<"time">;
            min: z.ZodOptional<z.ZodString>;
            max: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        }, {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        }>]>>, z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        }, "strip", z.ZodTypeAny, {
            position?: "left" | "right" | undefined;
        }, {
            position?: "left" | "right" | undefined;
        }>>, "many">;
        series: z.ZodArray<z.ZodUnion<[z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, "strip", z.ZodTypeAny, {
                position: "top" | "inside";
                show: boolean;
            }, {
                position: "top" | "inside";
                show: boolean;
            }>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                hideOverlap: boolean;
            }, {
                hideOverlap: boolean;
            }>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, "strip", z.ZodTypeAny, {
                x: string | number;
                y: string | number;
            }, {
                x: string | number;
                y: string | number;
            }>>;
        } & {
            type: z.ZodLiteral<"bar">;
            stack: z.ZodOptional<z.ZodString>;
            barWidth: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        }, {
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, "strip", z.ZodTypeAny, {
                position: "top" | "inside";
                show: boolean;
            }, {
                position: "top" | "inside";
                show: boolean;
            }>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                hideOverlap: boolean;
            }, {
                hideOverlap: boolean;
            }>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, "strip", z.ZodTypeAny, {
                x: string | number;
                y: string | number;
            }, {
                x: string | number;
                y: string | number;
            }>>;
        } & {
            type: z.ZodLiteral<"scatter">;
            itemStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                color?: string | undefined;
            }, {
                color?: string | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        }, {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        }>, z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<[z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, "strip", z.ZodTypeAny, {
                position: "top" | "inside";
                show: boolean;
            }, {
                position: "top" | "inside";
                show: boolean;
            }>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                hideOverlap: boolean;
            }, {
                hideOverlap: boolean;
            }>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, "strip", z.ZodTypeAny, {
                x: string | number;
                y: string | number;
            }, {
                x: string | number;
                y: string | number;
            }>>;
        } & {
            type: z.ZodLiteral<"line">;
            areaStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                color?: string | undefined;
            }, {
                color?: string | undefined;
            }>>;
            lineStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                color?: string | undefined;
            }, {
                color?: string | undefined;
            }>>;
            itemStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                color?: string | undefined;
            }, {
                color?: string | undefined;
            }>>;
            stack: z.ZodOptional<z.ZodString>;
            symbolSize: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        }, {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        }>]>, "many">;
    }, "strip", z.ZodTypeAny, {
        tooltip: {
            trigger: "axis";
        };
        legend: {};
        grid: {
            containLabel: true;
        };
        dataset: {
            source: Record<string, string | number>[];
            dimensions: string[];
        }[];
        xAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            axisPointer: {
                type: "shadow";
            };
        })[];
        yAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            position?: "left" | "right" | undefined;
        })[];
        series: ({
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        } | {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        } | {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        })[];
    }, {
        tooltip: {
            trigger: "axis";
        };
        legend: {};
        grid: {
            containLabel: true;
        };
        dataset: {
            source: Record<string, string | number>[];
            dimensions: string[];
        }[];
        xAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            axisPointer: {
                type: "shadow";
            };
        })[];
        yAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            position?: "left" | "right" | undefined;
        })[];
        series: ({
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        } | {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        } | {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        })[];
    }>;
}, "strip", z.ZodTypeAny, {
    result: {
        tooltip: {
            trigger: "axis";
        };
        legend: {};
        grid: {
            containLabel: true;
        };
        dataset: {
            source: Record<string, string | number>[];
            dimensions: string[];
        }[];
        xAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            axisPointer: {
                type: "shadow";
            };
        })[];
        yAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            position?: "left" | "right" | undefined;
        })[];
        series: ({
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        } | {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        } | {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        })[];
    };
    executedAt: string;
    tooManyDataPoints: boolean;
}, {
    result: {
        tooltip: {
            trigger: "axis";
        };
        legend: {};
        grid: {
            containLabel: true;
        };
        dataset: {
            source: Record<string, string | number>[];
            dimensions: string[];
        }[];
        xAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            axisPointer: {
                type: "shadow";
            };
        })[];
        yAxis: (({
            nameLocation: "middle";
            position?: "left" | "right" | "top" | "bottom" | undefined;
            name?: string | null | undefined;
            nameGap?: number | undefined;
        } & ({
            type: "value";
            min?: number | "dataMin" | undefined;
            max?: number | "dataMax" | undefined;
        } | {
            type: "category";
        } | {
            type: "time";
            min?: string | undefined;
            max?: string | undefined;
        })) & {
            position?: "left" | "right" | undefined;
        })[];
        series: ({
            type: "bar";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            barWidth?: string | undefined;
            color?: string | undefined;
        } | {
            type: "scatter";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
        } | {
            type: "line";
            id: string;
            datasetIndex: number;
            yAxisIndex: number;
            z: number;
            label?: {
                position: "top" | "inside";
                show: boolean;
            } | undefined;
            name?: string | number | undefined;
            labelLayout?: {
                hideOverlap: boolean;
            } | undefined;
            encode?: {
                x: string | number;
                y: string | number;
            } | undefined;
            stack?: string | undefined;
            itemStyle?: {
                color?: string | undefined;
            } | undefined;
            areaStyle?: {
                color?: string | undefined;
            } | undefined;
            lineStyle?: {
                color?: string | undefined;
            } | undefined;
            symbolSize?: number | undefined;
        })[];
    };
    executedAt: string;
    tooManyDataPoints: boolean;
}>;
export type VisualizationV2BlockOutput = z.infer<typeof VisualizationV2BlockOutput>;
export type VisualizationV2Block = BaseBlock<BlockType.VisualizationV2> & {
    input: VisualizationV2BlockInput;
    output: VisualizationV2BlockOutput | null;
    controlsHidden: boolean;
    error: "dataframe-not-found" | "dataframe-not-set" | "unknown" | "invalid-params" | null;
};
export declare function isVisualizationV2Block(block: YBlock): block is Y.XmlElement<VisualizationV2Block>;
export declare function makeVisualizationV2Block(id: string, input?: Partial<VisualizationV2BlockInput>): Y.XmlElement<VisualizationV2Block>;
export declare function getVisualizationV2Attributes(block: Y.XmlElement<VisualizationV2Block>): VisualizationV2Block;
export declare function duplicateVisualizationV2Block(newId: string, block: Y.XmlElement<VisualizationV2Block>): Y.XmlElement<VisualizationV2Block>;
export declare function getVisualizationV2BlockResultStatus(block: Y.XmlElement<VisualizationV2Block>): ResultStatus;
export declare function getVisualizationV2BlockExecutedAt(block: Y.XmlElement<VisualizationV2Block>): Date | null;
export declare function getVisualizationV2BlockIsDirty(_block: Y.XmlElement<VisualizationV2Block>): boolean;
export declare function getVisualizationV2BlockErrorMessage(block: Y.XmlElement<VisualizationV2Block>): string | null;
export declare function getDataframeFromVisualizationV2(block: Y.XmlElement<VisualizationV2Block>, dataframes: Y.Map<DataFrame>): {
    name: string;
    columns: ({
        type: "byte" | "ubyte" | "short" | "ushort" | "i1" | "i2" | "i4" | "i8" | "int0" | "int" | "Int" | "int8" | "Int8" | "int16" | "Int16" | "int32" | "Int32" | "int64" | "Int64" | "long" | "longlong" | "u1" | "u2" | "u4" | "u8" | "uint0" | "uint8" | "uint16" | "uint32" | "uint64" | "UInt0" | "UInt8" | "UInt16" | "UInt32" | "UInt64" | "uint" | "UInt" | "ulong" | "ULong" | "ulonglong" | "ULongLong" | "f2" | "f4" | "f8" | "f16" | "float16" | "float32" | "float64" | "float128" | "Float" | "Float16" | "Float32" | "Float64" | "float" | "longfloat" | "double" | "longdouble" | "timedelta64" | "timedelta64[ns]" | "timedelta64[ns, UTC]" | "timedelta64[us]" | "timedelta64[us, UTC]";
        name: string | number;
    } | {
        type: "string" | "object" | "unicode" | "str" | "bytes" | "bytes0" | "str0" | "category" | "object0";
        name: string | number;
        categories?: (string | number | boolean)[] | undefined;
    } | {
        type: "dbdate" | "dbtime" | "datetime64" | "datetime64[ns]" | "datetime64[ns, UTC]" | "datetime64[ns, Etc/UTC]" | "datetime64[us]" | "datetime64[us, UTC]" | "datetime64[us, Etc/UTC]" | "period" | "period[Y-DEC]" | "period[Q-DEC]" | "period[M]" | "period[Q]" | "period[W]" | "period[D]" | "period[h]" | "period[min]" | "period[m]" | "period[s]" | "period[ms]" | "period[us]" | "period[ns]";
        name: string | number;
    } | {
        type: "boolean" | "bool" | "bool8" | "b1";
        name: string | number;
    })[];
    id?: string | undefined;
    updatedAt?: string | undefined;
    blockId?: string | undefined;
} | null;
export declare function setVisualizationV2Input(block: Y.XmlElement<VisualizationV2Block>, next: Partial<VisualizationV2BlockInput>): void;
export declare function getDefaultDateFormat(): DateFormat;
export declare function getDefaultNumberFormat(): NumberFormat;
export declare function createDefaultSeries(): Series;
export {};
//# sourceMappingURL=visualization-v2.d.ts.map