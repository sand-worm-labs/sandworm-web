import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@sandworm/postgresql-typeorm';

export class UserResponse {
  @ApiProperty({
    type: String,
  })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'johndoe',
  })
  @Expose({ groups: ['me', 'admin'] })
  username?: string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email?: string;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName?: string;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName?: string;

  @ApiProperty({
    type: String,
    example: 'John Doe',
  })
  fullName?: string;

  @ApiProperty({
    type: Boolean,
    example: true,
  })
  isOnboarded!: boolean;

  @ApiProperty({
    type: String,
    example: 'https://example.com/avatar.jpg',
  })
  avatar?: string;

  // Static method to map from UserEntity to UserResponse
  static fromEntity(entity: UserEntity): UserResponse {
    const response = new UserResponse();
    response.id = entity.id;
    response.username = entity.username;
    response.email = entity.email;
    response.firstName = entity.firstName;
    response.lastName = entity.lastName;
    response.fullName = entity.fullName;
    response.isOnboarded = entity.isOnboarded;
    response.avatar = entity.avater;
    return response;
  }

  // Static method to map array of entities
  static fromEntities(entities: UserEntity[]): UserResponse[] {
    return entities.map(entity => UserResponse.fromEntity(entity));
  }
}