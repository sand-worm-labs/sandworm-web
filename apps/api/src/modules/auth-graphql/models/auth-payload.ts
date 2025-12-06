import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/model/graphql/user.model';

@ObjectType()
export class AuthPayload {
  @Field(() => String )
  id!: string;

  @Field(() => String)
  token!: string;

  @Field(() => Int)
  tokenExpires: number;

  @Field(() => User)
  user!: User;
}