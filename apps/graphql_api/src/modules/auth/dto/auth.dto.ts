import { InputType } from '@nestjs/graphql';
import { EmailField, PasswordField } from '@sandworm/graphql';

@InputType({ description: 'Login input' })
export class LoginInput {
  @EmailField({ description: 'Email address' })
  readonly email: string;

  @PasswordField({ description: 'Password' })
  readonly password: string;
}
