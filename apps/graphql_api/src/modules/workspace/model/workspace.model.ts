import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../user/model/user.model';
import { Document } from '../../document/model/document.model';
//import { OnboardingTutorial } from './onboarding_tutorial.model';
import { Plan } from '@sandworm/postgresql-typeorm';

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

  @Field(() => Plan)
  plan!: Plan;

  @Field(() => ID)
  ownerId!: string;

  @Field(() => User)
  owner!: User;

  @Field(() => [Document])
  documents!: Document[];

  // @Field(() => [OnboardingTutorial])
  // onboardingTutorials!: OnboardingTutorial[];
}
