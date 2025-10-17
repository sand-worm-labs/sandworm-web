import { setSeederFactory } from 'typeorm-extension';
import { UserSettingEntity } from '../entities';

export default setSeederFactory(UserSettingEntity, (fake) => {
  const setting = new UserSettingEntity();

  // setting.userId = 1; // adjust as needed
  // setting.theme = fake.helpers.arrayElement(['light', 'dark']);
  // setting.notifications = fake.datatype.boolean();

  return setting;
});