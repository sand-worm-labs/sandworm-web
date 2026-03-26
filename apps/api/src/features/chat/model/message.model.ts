import { Field, ObjectType } from '@nestjs/graphql';
import { BooleanField, DateField, StringField, UUIDField } from '@sandworm/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { MessageEntity } from '@sandworm/postgresql-typeorm';

@ObjectType()
export class Message {
  @UUIDField()
  id!: string;

  @UUIDField()
  chatId!: string;

  @StringField()
  role!: string;

  @StringField()
  content!: string;

  @Field(() => GraphQLJSON, { nullable: true })
  parts?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  attachments?: any;

  @DateField()
  createdAt!: Date;

  static fromEntity(entity: MessageEntity): Message {
    const message = new Message();
    message.id = entity.id;
    message.chatId = entity.chat?.id ?? (entity as any).chatId;
    message.role = entity.role;
    message.content = entity.content;
    message.parts = entity.parts;
    message.attachments = entity.attachments;
    message.createdAt = entity.createdAt;
    return message;
  }

  static fromEntities(entities: MessageEntity[]): Message[] {
    return entities.map((e) => Message.fromEntity(e));
  }
}
