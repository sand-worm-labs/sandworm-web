import { ObjectType, Field } from '@nestjs/graphql';
import { StringField } from '@sandworm/graphql';
import { User } from '@/features/user/model/graphql/user.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class AuthPayload {
  @StringField()
  id!: string;

  @Field(() => User)
  user!: User;

  @Field(() => GraphQLJSON, { nullable: true })
  roles?: Record<string, string>[];
}