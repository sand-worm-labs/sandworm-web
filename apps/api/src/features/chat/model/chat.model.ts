import { Field, ObjectType } from '@nestjs/graphql';
import { BooleanField, DateField, StringField, UUIDField } from '@sandworm/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { ChatEntity } from '@sandworm/postgresql-typeorm';
import { Message } from './message.model';

@ObjectType()
export class Chat {
  @UUIDField()
  id!: string;

  @UUIDField()
  userId!: string;

  @StringField()
  title!: string;

  @BooleanField()
  private!: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  lastContext?: Record<string, any> | null;

  @Field(() => [Message], { nullable: true })
  messages?: Message[];

  @DateField()
  createdAt!: Date;

  @DateField()
  updatedAt!: Date;

  static fromEntity(entity: ChatEntity, includeMessages = false): Chat {
    const chat = new Chat();
    chat.id = entity.id;
    chat.userId = entity.userId;
    chat.title = entity.title;
    chat.private = entity.private;
    chat.lastContext = entity.lastContext;
    chat.createdAt = entity.createdAt;
    chat.updatedAt = entity.updatedAt;
    if (includeMessages && entity.messages) {
      chat.messages = Message.fromEntities(entity.messages);
    }
    return chat;
  }

  static fromEntities(entities: ChatEntity[]): Chat[] {
    return entities.map((e) => Chat.fromEntity(e));
  }
}
