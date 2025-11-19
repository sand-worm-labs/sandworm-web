import { Field, ObjectType , Int} from '@nestjs/graphql';
import { UserSetting } from './user-setting.model';

@ObjectType()
export class User {
  @Field(() => String )
  id!: string;

  @Field(() => String, { nullable: true })
  username?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;

  @Field(() => String, { nullable: true })
  fullName?: string;

  @Field(() => Boolean)
  isOnboarded!: boolean;

  @Field(() => String, { nullable: true })
  image?: string;

  @Field(() => UserSetting, { nullable: true })
  settings?: UserSetting | null;

  @Field(() => Int, { nullable: true })
  followersCount: number = 0;

  @Field(() => Int, { nullable: true })
  followingCount: number = 0;
}
