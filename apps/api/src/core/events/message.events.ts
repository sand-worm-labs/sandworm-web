export class MessageCreatedEvent {
  chatId: string;
}

export const MessageEventNames = {
  MESSAGE_CREATED: 'message.created',
} as const;
