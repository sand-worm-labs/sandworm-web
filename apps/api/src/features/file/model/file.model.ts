import { ObjectType } from '@nestjs/graphql';
import { BooleanField, NumberField, StringField, StringFieldOptional } from '@sandworm/graphql';

@ObjectType()
export class SandwormFile {
  @StringField()
  name!: string;

  @StringField()
  path!: string;

  @StringField()
  relCwdPath!: string;

  @NumberField()
  size!: number;

  @StringFieldOptional()
  mimeType?: string;

  @BooleanField()
  isDirectory!: boolean;

  @NumberField()
  createdAt!: number;
}