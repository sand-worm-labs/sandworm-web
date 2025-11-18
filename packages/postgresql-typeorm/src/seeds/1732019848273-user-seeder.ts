import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserEntity, UserSettingEntity } from '../entities';

export class UserSeeder1732019848273 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(UserEntity);
    const userFactory = factoryManager.get(UserEntity);
    const userSettingFactory = factoryManager.get(UserSettingEntity);
    const adminUser = await repository.findOneBy({ username: 'admin' });
    if (!adminUser) {
      const user = await userFactory.make({
        username: 'admin',
        email: 'admin@example.com',
      });
      await repository.insert(user);

      const userSetting = await userSettingFactory.make({
        userId: user.id,
      });
      await dataSource.getRepository(UserSettingEntity).insert(userSetting);
    }

    await userFactory.saveMany(10);
  }
}
