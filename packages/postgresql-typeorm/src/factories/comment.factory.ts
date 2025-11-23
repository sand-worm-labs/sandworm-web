import { setSeederFactory } from 'typeorm-extension';
import { CommentEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(CommentEntity, () => {
  const comment = new CommentEntity();

  comment.body = fake.lorem.paragraphs(1);

  return comment;
});