import { HideField, ObjectType } from '@nestjs/graphql';
import { BooleanField, StringField } from '@sandworm/graphql';

@ObjectType()
export class Profile {
  @HideField()
  id?: string;

  @StringField()
  username!: string;

  @StringField()
  bio!: string;

  @StringField()
  image!: string;

  @BooleanField()
  following!: boolean;
}
