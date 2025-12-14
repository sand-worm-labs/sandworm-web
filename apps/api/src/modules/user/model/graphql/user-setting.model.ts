import { ObjectType, Field, ID } from '@nestjs/graphql';
import { DateFieldOptional, StringFieldOptional } from '@sandworm/graphql';
import { GraphQLJSON } from 'graphql-type-json';

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

  @StringFieldOptional()
  statusText!: string;

  @DateFieldOptional()
  statusUpdatedAt!: Date;

  @StringFieldOptional()
  theme!: 'light' | 'dark';

  @Field(() => [GraphQLJSON])
  wallets!: { chain: string; address: string }[];
}
