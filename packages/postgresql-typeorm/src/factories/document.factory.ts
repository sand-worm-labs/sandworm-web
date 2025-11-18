import { setSeederFactory } from 'typeorm-extension';
import { DocumentEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(DocumentEntity, () => {
  const document = new DocumentEntity(); // renamed variable to match entity

  document.title = fake.lorem.sentence();
  document.slug = fake.lorem.slug();
  document.description = fake.lorem.sentence();
  document.body = fake.lorem.paragraphs(10);

  return document;
});