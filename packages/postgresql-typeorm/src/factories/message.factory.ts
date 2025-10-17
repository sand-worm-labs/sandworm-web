import { setSeederFactory } from 'typeorm-extension';
import { MessageEntity } from '../entities';

export default setSeederFactory(MessageEntity, (fake) => {
  const message = new MessageEntity();

  // Content of the message
  // message.body = fake.lorem.sentences(3); // generate a few sentences
  message.role = fake.helpers.arrayElement(['user', 'assistant']); // user or AI role
  //message.chatId = 1;       // link to a chat/conversation
  //message.authorId = 1;     // optional, can be user or AI ID

  return message;
});