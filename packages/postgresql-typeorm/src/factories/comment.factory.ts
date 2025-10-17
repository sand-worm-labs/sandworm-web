import { setSeederFactory } from 'typeorm-extension';
import { CommentEntity } from '../entities';

export default setSeederFactory(CommentEntity, (fake) => {
  const comment = new CommentEntity();

  comment.body = fake.lorem.paragraphs(1);
  //comment.documentId = 1; // adjust as needed
  //comment.authorId = 1;   // adjust as needed
  // comment.createdAt = fake.date.past();
  // comment.updatedAt = fake.date.recent();

  return comment;
});