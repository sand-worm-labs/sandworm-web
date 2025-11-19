import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserEntity, UserSettingEntity } from '../entities';

export class UserSeeder1732019848272 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepository = dataSource.getRepository(UserEntity);
    const userSettingRepository = dataSource.getRepository(UserSettingEntity);

    const userFactory = factoryManager.get(UserEntity);
    const userSettingFactory = factoryManager.get(UserSettingEntity);

    const adminUser = await userRepository.findOneBy({
      username: 'admin',
    });

    if (!adminUser) {
      const admin = await userFactory.make({
        username: 'admin',
        email: 'admin@example.com',
      });

      await userRepository.insert(admin);

      const adminSetting = await userSettingFactory.make({
        userId: admin.id,
      });
      await userSettingRepository.insert(adminSetting);
    }

    const users = await userFactory.saveMany(10);

    for (const user of users) {
      const userSetting = await userSettingFactory.make({
        userId: user.id,
      });

      await userSettingRepository.insert(userSetting);
    }
  }
}
