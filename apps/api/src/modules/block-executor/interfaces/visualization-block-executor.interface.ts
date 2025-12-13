import * as Y from 'yjs';
import { ExecutionQueueItem, VisualizationV2Block } from '@sandworm/editor';
import { ExecutionContext } from './execution-context.interface';

export interface IVisualizationBlockExecutor {
  /**
   * Validate and prepare visualization block
   */
  run(
    executionItem: ExecutionQueueItem,
    block: Y.XmlElement<VisualizationV2Block>,
    context: ExecutionContext,
  ): Promise<void>;
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'scatter'
  | 'pie'
  | 'area'
  | 'histogram'
  | 'boxplot'
  | 'heatmap';

export interface VisualizationConfig {
  chartType: ChartType;
  dataframeName: string;
  xAxis?: string;
  yAxis?: string | string[];
  groupBy?: string;
  colorScheme?: string;
  title?: string;
  spec?: any; // Vega-Lite spec
}