import { OmitType } from '@nestjs/swagger';
import { CreateBlockDto } from './create-blocks.dto';

// Everything a block was created with can be changed except its kind and, for
// power toolbox blocks, its tool. Each field is optional: omitted means unchanged.
export class UpdateBlockDto extends OmitType(CreateBlockDto, ['kind', 'toolId'] as const) {}
