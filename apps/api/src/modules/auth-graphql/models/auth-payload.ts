import { ObjectType, Field, Float } from '@nestjs/graphql';
import { StringField } from '@sandworm/graphql';
import { User } from '../../user/model/graphql/user.model';

@ObjectType()
export class AuthPayload {
  @StringField()
  id!: string;

  @StringField()
  token!: string;

  @Field(() => Float)
  tokenExpires!: number;

  @Field(() => User)
  user!: User;
}