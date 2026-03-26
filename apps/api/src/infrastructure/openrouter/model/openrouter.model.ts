import { NumberField,} from '@sandworm/graphql';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class OpenRouterModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => GraphQLJSON)
  details: any; 
}
@ObjectType()
export class OpenRouterAccountCredits {
  @NumberField()
  totalCredits!: number;

  @NumberField()
  usedCredits!: number;

  @NumberField()
  availableCredits!: number;
}
