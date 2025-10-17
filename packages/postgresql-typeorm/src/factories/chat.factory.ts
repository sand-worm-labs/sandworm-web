import { setSeederFactory } from 'typeorm-extension';
import { ChatEntity } from '../entities';

export default setSeederFactory(ChatEntity, (fake) => {
    const chat = new ChatEntity();

    //chat.body = fake.lorem.paragraphs(1);
    // chat.documentId = 1; // adjust as needed
    // chat.authorId = 1;   // adjust as needed

    return chat;
});