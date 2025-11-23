import { setSeederFactory } from 'typeorm-extension';
import { TagEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(TagEntity, async () => {
  const tag = new TagEntity();

  let uniqueName: string;
  do {
    uniqueName = fake.lorem.words({ min: 1, max: 4 });
  } while (await TagEntity.findOneBy({ name: uniqueName }));
  tag.name = uniqueName;

  return tag;
});
