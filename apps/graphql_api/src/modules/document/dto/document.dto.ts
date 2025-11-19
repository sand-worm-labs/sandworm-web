import { InputType, Int } from '@nestjs/graphql';
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
}
