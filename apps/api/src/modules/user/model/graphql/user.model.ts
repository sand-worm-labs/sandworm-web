import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '@sandworm/postgresql-typeorm';

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
  avater?: string;

  static fromEntity(entity: UserEntity): User {
    const user = new User();
    user.id = entity.id;
    user.username = entity.username;
    user.email = entity.email;
    user.firstName = entity.firstName;
    user.lastName = entity.lastName;
    user.fullName = entity.fullName;
    user.isOnboarded = entity.isOnboarded;
    user.avater = entity.avater;
    return user;
  }

  static fromEntities(entities: UserEntity[]): User[] {
    return entities.map(entity => User.fromEntity(entity));
  }
}
