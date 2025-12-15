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
export class UpdateUserSettingInput {
  @Field(() => GraphQLJSON, { nullable: true, defaultValue: {} })
  socialLinks?: {
    telegram?: string;
    twitter?: string;
    github?: string;
    discord?: string;
    email?: string;
    warpcast?: string;
  };

  @StringFieldOptional({ defaultValue: "Just joined Sandworm!" })
  statusText?: string;

  @Field(() => [GraphQLJSON], { nullable: true, defaultValue: [] })
  wallets?: { chain: string; address: string }[];
}