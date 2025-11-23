import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';
import { Plan } from '@sandworm/postgresql-typeorm';


registerEnumType(Plan, {
    name: 'WorkspacePlan',
    description: 'Price plan of the workspace',
});

@ObjectType()
export class Workspace {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => String, { nullable: true })
  source?: string;

  @Field(() => [String])
  useCases!: string[];

  @Field(() => String, { nullable: true })
  useContext?: string;

  @Field(() => Plan , { defaultValue: Plan.FREE })
  plan!: Plan;

  @Field(() => ID)
  ownerId!: string;
}
