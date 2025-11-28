import { ArgsType } from '@nestjs/graphql';
import { StringField } from '@sandworm/graphql';

@ArgsType()
export class UsernameArgs {
  @StringField({
    description: 'Username of the profile',
  })
  username: string;
}
