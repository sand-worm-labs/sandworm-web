import { setSeederFactory } from 'typeorm-extension';
import { UserEntity } from '../entities';
import { fake } from '../utils';

export default setSeederFactory(UserEntity, () => {
  const user = new UserEntity();

  const firstName = fake.person.firstName();
  const lastName = fake.person.lastName();

  user.username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  user.email = fake.internet.email({ firstName, lastName }).toLowerCase();
  user.password = '12345678';
  user.avater = fake.image.avatar();

  return user;
});
