import { setSeederFactory } from 'typeorm-extension';
import { UserFollowsEntity } from '../entities';

export default setSeederFactory(UserFollowsEntity, (fake) => {
  const follow = new UserFollowsEntity();

  // follow.followerId = 1; // adjust as needed
  // follow.followingId = 2; // adjust as needed
  follow.createdAt = fake.date.past();

  return follow;
});