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
declare const Serie: z.ZodUnion<readonly [z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, z.core.$strip>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, z.core.$strip>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"bar">;
    stack: z.ZodOptional<z.ZodString>;
    barWidth: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, z.core.$strip>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, z.core.$strip>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"scatter">;
    itemStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
    datasetIndex: z.ZodNumber;
    yAxisIndex: z.ZodNumber;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
    z: z.ZodNumber;
    label: z.ZodOptional<z.ZodObject<{
        show: z.ZodBoolean;
        position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
    }, z.core.$strip>>;
    labelLayout: z.ZodOptional<z.ZodObject<{
        hideOverlap: z.ZodBoolean;
    }, z.core.$strip>>;
    encode: z.ZodOptional<z.ZodObject<{
        x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, z.core.$strip>>;
    type: z.ZodLiteral<"line">;
    areaStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    lineStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    itemStyle: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    stack: z.ZodOptional<z.ZodString>;
    symbolSize: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>]>;
export type Serie = z.infer<typeof Serie>;
declare const XAxis: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nameLocation: z.ZodLiteral<"middle">;
    nameGap: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"value">;
    min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
    max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"category">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"time">;
    min: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodString>;
}, z.core.$strip>]>>, z.ZodObject<{
    axisPointer: z.ZodObject<{
        type: z.ZodLiteral<"shadow">;
    }, z.core.$strip>;
}, z.core.$strip>>;
export type XAxis = z.infer<typeof XAxis>;
declare const YAxis: z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nameLocation: z.ZodLiteral<"middle">;
    nameGap: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"value">;
    min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
    max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"category">;
}, z.core.$strip>, z.ZodObject<{
    type: z.ZodLiteral<"time">;
    min: z.ZodOptional<z.ZodString>;
    max: z.ZodOptional<z.ZodString>;
}, z.core.$strip>]>>, z.ZodObject<{
    position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
}, z.core.$strip>>;
export declare const VisualizationV2BlockOutputResult: z.ZodObject<{
    tooltip: z.ZodObject<{
        trigger: z.ZodLiteral<"axis">;
    }, z.core.$strip>;
    legend: z.ZodObject<{}, z.core.$strip>;
    grid: z.ZodObject<{
        containLabel: z.ZodLiteral<true>;
    }, z.core.$strip>;
    dataset: z.ZodArray<z.ZodObject<{
        dimensions: z.ZodArray<z.ZodString>;
        source: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
    }, z.core.$strip>>;
    xAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        nameLocation: z.ZodLiteral<"middle">;
        nameGap: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"value">;
        min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
        max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"category">;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"time">;
        min: z.ZodOptional<z.ZodString>;
        max: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>, z.ZodObject<{
        axisPointer: z.ZodObject<{
            type: z.ZodLiteral<"shadow">;
        }, z.core.$strip>;
    }, z.core.$strip>>>;
    yAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        nameLocation: z.ZodLiteral<"middle">;
        nameGap: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"value">;
        min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
        max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"category">;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodLiteral<"time">;
        min: z.ZodOptional<z.ZodString>;
        max: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>]>>, z.ZodObject<{
        position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
    }, z.core.$strip>>>;
    series: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, z.core.$strip>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, z.core.$strip>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"bar">;
        stack: z.ZodOptional<z.ZodString>;
        barWidth: z.ZodOptional<z.ZodString>;
        color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, z.core.$strip>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, z.core.$strip>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"scatter">;
        itemStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        datasetIndex: z.ZodNumber;
        yAxisIndex: z.ZodNumber;
        name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
        z: z.ZodNumber;
        label: z.ZodOptional<z.ZodObject<{
            show: z.ZodBoolean;
            position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
        }, z.core.$strip>>;
        labelLayout: z.ZodOptional<z.ZodObject<{
            hideOverlap: z.ZodBoolean;
        }, z.core.$strip>>;
        encode: z.ZodOptional<z.ZodObject<{
            x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        type: z.ZodLiteral<"line">;
        areaStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        lineStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        itemStyle: z.ZodOptional<z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        stack: z.ZodOptional<z.ZodString>;
        symbolSize: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>]>>;
}, z.core.$strip>;
export type VisualizationV2BlockOutputResult = z.infer<typeof VisualizationV2BlockOutputResult>;
export declare const VisualizationV2BlockOutput: z.ZodObject<{
    executedAt: z.ZodString;
    tooManyDataPoints: z.ZodBoolean;
    result: z.ZodObject<{
        tooltip: z.ZodObject<{
            trigger: z.ZodLiteral<"axis">;
        }, z.core.$strip>;
        legend: z.ZodObject<{}, z.core.$strip>;
        grid: z.ZodObject<{
            containLabel: z.ZodLiteral<true>;
        }, z.core.$strip>;
        dataset: z.ZodArray<z.ZodObject<{
            dimensions: z.ZodArray<z.ZodString>;
            source: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodNumber]>>>;
        }, z.core.$strip>>;
        xAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
            name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            nameLocation: z.ZodLiteral<"middle">;
            nameGap: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"value">;
            min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
            max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"category">;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"time">;
            min: z.ZodOptional<z.ZodString>;
            max: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>]>>, z.ZodObject<{
            axisPointer: z.ZodObject<{
                type: z.ZodLiteral<"shadow">;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
        yAxis: z.ZodArray<z.ZodIntersection<z.ZodIntersection<z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"top">, z.ZodLiteral<"bottom">, z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
            name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            nameLocation: z.ZodLiteral<"middle">;
            nameGap: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"value">;
            min: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMin">]>>;
            max: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"dataMax">]>>;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"category">;
        }, z.core.$strip>, z.ZodObject<{
            type: z.ZodLiteral<"time">;
            min: z.ZodOptional<z.ZodString>;
            max: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>]>>, z.ZodObject<{
            position: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"left">, z.ZodLiteral<"right">]>>;
        }, z.core.$strip>>>;
        series: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, z.core.$strip>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, z.core.$strip>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"bar">;
            stack: z.ZodOptional<z.ZodString>;
            barWidth: z.ZodOptional<z.ZodString>;
            color: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, z.core.$strip>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, z.core.$strip>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"scatter">;
            itemStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            id: z.ZodString;
            datasetIndex: z.ZodNumber;
            yAxisIndex: z.ZodNumber;
            name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber]>>;
            z: z.ZodNumber;
            label: z.ZodOptional<z.ZodObject<{
                show: z.ZodBoolean;
                position: z.ZodUnion<readonly [z.ZodLiteral<"inside">, z.ZodLiteral<"top">]>;
            }, z.core.$strip>>;
            labelLayout: z.ZodOptional<z.ZodObject<{
                hideOverlap: z.ZodBoolean;
            }, z.core.$strip>>;
            encode: z.ZodOptional<z.ZodObject<{
                x: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
                y: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
            }, z.core.$strip>>;
            type: z.ZodLiteral<"line">;
            areaStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            lineStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            itemStyle: z.ZodOptional<z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            stack: z.ZodOptional<z.ZodString>;
            symbolSize: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>]>>;
    }, z.core.$strip>;
}, z.core.$strip>;
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