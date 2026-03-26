import { InputType } from '@nestjs/graphql';
import { BooleanFieldOptional, StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';

@InputType()
export class CreateChatInput {
  @StringField({ minLength: 1, maxLength: 255 })
  title!: string;
}

@InputType()
export class UpdateChatInput {
  @UUIDField()
  chatId!: string;

  @StringFieldOptional({ minLength: 1, maxLength: 255 })
  title?: string;

  @BooleanFieldOptional()
  private?: boolean;
}

@InputType()
export class SendMessageInput {
  @UUIDField()
  chatId!: string;

  @StringField({ minLength: 1 })
  content!: string;
}
