import { setSeederFactory } from 'typeorm-extension';
import { UserSettingEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(UserSettingEntity, () => {
  const setting = new UserSettingEntity();

  setting.socialLinks = {
    telegram: fake.internet.username(),
    twitter: `https://twitter.com/${fake.internet.username()}`,
    github: `https://github.com/${fake.internet.username()}`,
    discord: `${fake.internet.username()}#${fake.number.int({ min: 1000, max: 9999 })}`,
    email: fake.internet.email(),
    warpcast: `https://warpcast.com/${fake.internet.username()}`,
  };
  setting.statusText = fake.lorem.sentence();
  setting.statusUpdatedAt = fake.date.recent();
  setting.wallets = Array.from({ length: fake.number.int({ min: 1, max: 3 }) }, () => ({
    chain: fake.helpers.arrayElement(['ethereum', 'solana', 'sui', 'polygon']),
    address: fake.string.hexadecimal({ length: 42 }),
  }));

  return setting;
});