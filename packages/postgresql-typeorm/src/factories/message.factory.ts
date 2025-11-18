import { setSeederFactory } from 'typeorm-extension';
import { MessageEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(MessageEntity, () => {
  const message = new MessageEntity();

  message.role = fake.helpers.arrayElement(['user', 'assistant']);
  message.parts = [
    { type: 'text', content: fake.lorem.paragraphs(2) },
    { type: 'code', content: 'console.log("Hello, world!");', language: 'javascript' },
  ];

  message.attachments = [
    { filename: 'image.png', path: fake.image.url() }
  ];
  return message;
});