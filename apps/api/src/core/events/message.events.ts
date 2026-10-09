export class MessageCreatedEvent {
  chatId: string;
  // The user message that was just saved: the turn the AI answers.
  messageId: string;
}

export const MessageEventNames = {
  MESSAGE_CREATED: 'message.created',
} as const;
