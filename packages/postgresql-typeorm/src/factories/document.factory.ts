import { setSeederFactory } from 'typeorm-extension';
import { DocumentEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(DocumentEntity, () => {
  const document = new DocumentEntity(); // renamed variable to match entity

  document.title = fake.lorem.sentence();
  document.slug = fake.lorem.slug();
  document.orderIndex = fake.number.int({ min: 1, max: 10 });
  document.version = 1;
  document.isSyncedWithYjs = fake.datatype.boolean();
  document.runUnexecutedBlocks =  fake.datatype.boolean(); 
  document.runSQLSelection =  fake.datatype.boolean();
  document.shareLinksWithoutSidebar =  fake.datatype.boolean();

  return document;
});