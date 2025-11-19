import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from './user.model';

@ObjectType('UserSetting')
export class UserSetting {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  socialLinks?: {
    telegram?: string;
    twitter?: string;
    github?: string;
    discord?: string;
    email?: string;
    warpcast?: string;
  };

  @Field(() => String)
  statusText!: string;

  @Field(() => Date)
  statusUpdatedAt!: Date;

  @Field(() => String)
  theme!: 'light' | 'dark';

  @Field(() => [GraphQLJSON])
  wallets!: { chain: string; address: string }[];
}
