import { setSeederFactory } from 'typeorm-extension';
import { UserEntity } from '../entities';

export default setSeederFactory(UserEntity, (fake) => {
  const user = new UserEntity();

  const firstName = fake.person.firstName();
  const lastName = fake.person.lastName();
  user.id = "bf91c434-dcf3-3a4c-b49a-12e0944ef1e2";
  user.username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  user.email = fake.internet.email({ firstName, lastName });
  user.password = '12345678';
  user.avater = fake.image.avatar();

  return user;
});
