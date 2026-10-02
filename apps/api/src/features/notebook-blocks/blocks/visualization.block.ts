import { BlockType } from '@sandworm/editor';
import type { BlockDefinition } from './block-definition';

// Binds a chart to a dataframe; the chart itself is configured in the editor.
// For a chart defined in code, use a python block with Plotly instead.
export const visualizationBlock: BlockDefinition = {
  kind: 'visualization',
  type: BlockType.VisualizationV2,
  toSpec: ({ title, dataframeName }) => ({ type: BlockType.VisualizationV2, title, dataframeName }),
  describe: () => ({}),
};
