import { BlockType, setVisualizationV2Input, type VisualizationV2Block } from '@sandworm/editor';
import type * as Y from 'yjs';
import type { BlockDefinition } from './block-definition';
import { assertDataframeName, assertOnly, patchTitle } from './update';

// Binds a chart to a dataframe; the chart itself is configured in the editor.
// For a chart defined in code, use a python block with Plotly instead.
export const visualizationBlock: BlockDefinition = {
  kind: 'visualization',
  type: BlockType.VisualizationV2,
  toSpec: ({ title, dataframeName }) => ({ type: BlockType.VisualizationV2, title, dataframeName }),
  describe: () => ({}),
  update(block, _blocks, patch) {
    assertOnly('visualization', patch, ['title', 'dataframeName']);
    patchTitle(block, patch);
    if (patch.dataframeName !== undefined) {
      assertDataframeName(patch.dataframeName);
      setVisualizationV2Input(block as Y.XmlElement<VisualizationV2Block>, { dataframeName: patch.dataframeName });
    }
  },
};
