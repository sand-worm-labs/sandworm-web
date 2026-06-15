import { Field, ObjectType } from '@nestjs/graphql';
import { DateField, StringField, StringFieldOptional, UUIDField } from '@sandworm/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { FocusedBlock, MessageEntity } from '@sandworm/postgresql-typeorm';

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

  @Field(() => GraphQLJSON, { nullable: true })
  focusedBlocks?: FocusedBlock[]

  @DateField()
  createdAt!: Date;

  @StringFieldOptional()
  model?: string;

  @StringFieldOptional()
  finishReason?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  static fromEntity(entity: MessageEntity): Message {
    const message = new Message();
    message.id = entity.id;
    message.chatId = entity.chat?.id ?? (entity as any).chatId;
    message.role = entity.role;
    message.focusedBlocks = entity.focusedBlocks;
    message.content = entity.content;
    message.parts = entity.parts;
    message.attachments = entity.attachments;
    message.createdAt = entity.createdAt;
    message.model = entity.model;
    message.finishReason = entity.finishReason;
    message.usage = entity.usage;
    return message;
  }

  static fromEntities(entities: MessageEntity[]): Message[] {
    return entities.map((e) => Message.fromEntity(e));
  }
}
