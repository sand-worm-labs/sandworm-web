import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/model/user.model';

@ObjectType()
export class AuthPayload {
  @Field(() => String )
  id!: string;

  @Field(() => String)
  token!: string;

  @Field(() => User)
  user!: User;
}
