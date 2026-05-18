import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FixAiResult {
  @Field()
  result: string;

  @Field()
  chatId: string;
}