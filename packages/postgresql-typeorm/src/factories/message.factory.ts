import { setSeederFactory } from 'typeorm-extension';
import { MessageEntity } from '../entities';
import { MessageRole, MessageContentType } from '../entities/message.entity';
import { fake } from '../utils';

export default setSeederFactory(MessageEntity, () => {
  const message = new MessageEntity();

  message.role = fake.helpers.arrayElement([MessageRole.USER, MessageRole.ASSISTANT]);

  message.parts = [
    {
      type: MessageContentType.TEXT,
      text: fake.lorem.paragraphs(2),
    },
  ];

  message.attachments = [
    {
      type: 'image',
      url: fake.image.url(),
      mimeType: 'image/png',
      name: 'image.png',
    },
  ];

  return message;
});