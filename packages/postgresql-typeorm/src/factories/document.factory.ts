import { setSeederFactory } from 'typeorm-extension';
import { DocumentEntity } from '../entities';

export default setSeederFactory(DocumentEntity, (fake) => {
  const document = new DocumentEntity(); // renamed variable to match entity

  document.title = fake.lorem.sentence();
  document.slug = fake.lorem.slug();
  document.description = fake.lorem.sentence();
  document.body = fake.lorem.paragraphs(10);
  document.authorId = "bf91c434-dcf3-3a4c-b49a-12e0944ef1e2";

  return document;
});