import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SandwormFile {
  @Field()
  name: string;

  @Field()
  path: string;

  @Field()
  relCwdPath: string;

  @Field()
  size: number;

  @Field({ nullable: true })
  mimeType?: string;

  @Field()
  isDirectory: boolean;
}