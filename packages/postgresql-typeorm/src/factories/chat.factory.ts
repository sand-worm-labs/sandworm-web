import { setSeederFactory } from 'typeorm-extension';
import { ChatEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(ChatEntity, () => {
    const chat = new ChatEntity();
    chat.title = fake.lorem.paragraphs(1);
    chat.private = fake.datatype.boolean();
    chat.lastContext = {
        topic: fake.lorem.words(3),
        mood: fake.helpers.arrayElement(['happy', 'neutral', 'sad']),
    };
    return chat;
});