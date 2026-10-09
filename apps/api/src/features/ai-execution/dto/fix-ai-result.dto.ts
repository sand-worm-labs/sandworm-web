import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AiResult {
  @Field()
  result: string;

  @Field(() => String, { nullable: true })
  chatId?: string;
}