import { Field, InputType } from '@nestjs/graphql';
import {
  EmailField,
  EmailFieldOptional,
  PasswordField,
  StringField,
  StringFieldOptional,
  URLFieldOptional,
  NumberFieldOptional,
} from '@sandworm/graphql';
import { lowerCaseTransformer } from '@sandworm/nest-common';
import { Transform } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';

@InputType({ description: 'User register request' })
export class CreateUserInput {
  @EmailField()
  email: string;

  @StringField()
  @Transform(lowerCaseTransformer)
  username: string;

  @PasswordField()
  password: string;
}

@InputType({ description: 'User update request' })
export class UpdateUserInput {
  @EmailFieldOptional()
  email?: string;

  @StringFieldOptional()
  @Transform(lowerCaseTransformer)
  username?: string;

  @StringFieldOptional()
  bio?: string;

  @URLFieldOptional()
  image?: string;
}

@InputType()
export class GetAllUsersInput {
  @NumberFieldOptional()
  limit: number;

  @NumberFieldOptional()
  offset: number;

  @StringField({ "defaultValue": "followersCount" })
  sortBy?: string;

  @StringField({ "defaultValue": 'DESC' })
  sortOrder?: 'ASC' | 'DESC';
}

@InputType()
export class SocialLinksInput {
  @StringFieldOptional()
  telegram?: string;

  @StringFieldOptional()
  twitter?: string;

  @StringFieldOptional()
  github?: string;

  @StringFieldOptional()
  discord?: string;

  @StringFieldOptional()
  email?: string;

  @StringFieldOptional()
  warpcast?: string;
}

@InputType()
export class WalletInput {
  @Field(() => String)
  chain: string;

  @Field(() => String)
  address: string;
}