import { setSeederFactory } from 'typeorm-extension';
import { DocumentEntity } from '../entities';
import { fake } from '../utils';
import { NOTEBOOK_TITLES, NOTEBOOK_META } from '../seeds/data/explore-seed-data';

export default setSeederFactory(DocumentEntity, () => {
  const document = new DocumentEntity(); // renamed variable to match entity

  const title = fake.helpers.arrayElement(NOTEBOOK_TITLES);
  const meta = NOTEBOOK_META[title];
  document.title = title;
  document.description = meta?.description ?? null;
  document.tags = meta?.tags ?? [];
  document.orderIndex = fake.number.int({ min: 1, max: 10 });
  document.version = 1;
  document.isSyncedWithYjs = fake.datatype.boolean();
  document.runUnexecutedBlocks =  fake.datatype.boolean();
  document.runSQLSelection =  fake.datatype.boolean();
  document.shareLinksWithoutSidebar =  fake.datatype.boolean();
  document.isDashboardPublic = fake.datatype.boolean();

  return document;
});