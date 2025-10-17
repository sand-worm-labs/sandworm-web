import { setSeederFactory } from 'typeorm-extension';
import { UserSettingEntity } from '../entities';

export default setSeederFactory(UserSettingEntity, (fake) => {
  const setting = new UserSettingEntity();

  setting.socialLinks = {
    telegram: fake.internet.userName(),
    twitter: `https://twitter.com/${fake.internet.userName()}`,
    github: `https://github.com/${fake.internet.userName()}`,
    discord: `${fake.internet.userName()}#${fake.number.int({ min: 1000, max: 9999 })}`,
    email: fake.internet.email(),
    warpcast: `https://warpcast.com/${fake.internet.userName()}`,
  };
  setting.statusText = fake.lorem.sentence();
  setting.statusUpdatedAt = fake.date.recent();
  setting.theme = fake.helpers.arrayElement(['light', 'dark']);
  setting.wallets = Array.from({ length: fake.number.int({ min: 1, max: 3 }) }, () => ({
    chain: fake.helpers.arrayElement(['ethereum', 'solana', 'sui', 'polygon']),
    address: fake.string.hexadecimal({ length: 42 }),
  }));

  return setting;
});