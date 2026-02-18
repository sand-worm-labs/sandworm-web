import { ObjectType } from '@nestjs/graphql';
import { BooleanField, DateFieldOptional, StringField, StringFieldOptional } from '@sandworm/graphql';
import { UserEntity } from '@sandworm/postgresql-typeorm';


@ObjectType()
export class User {
  @StringField()
  id!: string;

  @StringFieldOptional()
  username?: string;

  @StringFieldOptional()
  email?: string;

  @StringFieldOptional()
  firstName?: string;

  @StringFieldOptional()
  lastName?: string;

  @StringFieldOptional()
  fullName?: string;

  @BooleanField()
  isOnboarded!: boolean;

  @StringFieldOptional()
  avater?: string;

  @DateFieldOptional()
  createdAt?: Date;



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
    user.createdAt = entity.createdAt;

    return user;
  }

  static fromEntities(entities: UserEntity[]): User[] {
    return entities.map(entity => User.fromEntity(entity));
  }
}
