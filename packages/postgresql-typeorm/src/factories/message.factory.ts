import { setSeederFactory } from 'typeorm-extension';
import { MessageEntity } from '../entities';

export default setSeederFactory(MessageEntity, (fake) => {
  const message = new MessageEntity();

  message.role = fake.helpers.arrayElement(['user', 'assistant']);
  message.parts = [
    { type: 'text', content: fake.lorem.paragraphs(2) },
    { type: 'code', content: 'console.log("Hello, world!");', language: 'javascript' },
  ];

  message.attachments = [
    { filename: 'image.png', path: fake.image.imageUrl() }
  ];
  return message;
});