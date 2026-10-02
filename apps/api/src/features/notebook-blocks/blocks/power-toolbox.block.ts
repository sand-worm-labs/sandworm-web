import { BadRequestException } from '@nestjs/common';
import { BlockType, getPowerToolboxAttributes, type ParamDefinition, type PowerToolboxBlock } from '@sandworm/editor';
import type * as Y from 'yjs';
import type { BlockDefinition, BlockInput } from './block-definition';

export const powerToolboxBlock: BlockDefinition = {
  kind: 'power_toolbox',
  type: BlockType.PowerToolbox,

  toSpec({ title, toolId, inputs }) {
    if (!toolId) throw new BadRequestException('power_toolbox blocks need a toolId');
    return { type: BlockType.PowerToolbox, title, toolId, inputs: inputs ?? {} };
  },

  describe(block) {
    const { toolId } = getPowerToolboxAttributes(block as Y.XmlElement<PowerToolboxBlock>);
    return { toolId };
  },
};

export function validatePowerToolInputs(toolId: string, params: ParamDefinition[], inputs: BlockInput['inputs'] = {}): void {
  const known = new Set(params.map(p => p.key));
  const unknown = Object.keys(inputs).filter(key => !known.has(key));
  if (unknown.length) {
    throw new BadRequestException(`Tool "${toolId}" has no input(s) ${unknown.join(', ')}. Its inputs are: ${[...known].join(', ') || 'none'}`);
  }

  const missing = params.filter(p => p.required && p.default === undefined && inputs[p.key] === undefined).map(p => p.key);
  if (missing.length) {
    throw new BadRequestException(`Tool "${toolId}" is missing required input(s): ${missing.join(', ')}`);
  }
}
