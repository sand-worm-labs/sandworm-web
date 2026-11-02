// verifyPassword drags in argon2 (a native binding): stub just that export, as the auth spec does.
jest.mock('@sandworm/nest-common', () => ({
  ...jest.requireActual('@sandworm/nest-common'),
  verifyPassword: jest.fn(),
}));

import { UserEntity } from '@sandworm/postgresql-typeorm';
import { UserService } from '../user.service';

function makeService(stored: UserEntity) {
  const userRepository = {
    findOneBy: jest.fn().mockResolvedValue(stored),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(async (entity: unknown) => entity),
  } as any;
  const service = new UserService(userRepository, {} as any, {} as any, {} as any);
  return { service, userRepository };
}

describe('UserService.update', () => {
  it('saves the UserEntity instance, so its @BeforeUpdate hook hashes a new password', async () => {
    const stored = Object.assign(new UserEntity(), { id: 'u1', email: 'a@b.com' });
    const { service, userRepository } = makeService(stored);

    await service.update('u1', { password: 'new-password' });

    // TypeORM calls entity listeners only when `entity.constructor` is the entity class.
    // A spread copy has Object as its constructor, so the password would be stored unhashed.
    const saved = userRepository.save.mock.calls[0][0];
    expect(saved).toBeInstanceOf(UserEntity);
    expect(saved).toMatchObject({ id: 'u1', email: 'a@b.com', password: 'new-password' });
  });

  it('refuses a username another user already has', async () => {
    const stored = Object.assign(new UserEntity(), { id: 'u1', username: 'old' });
    const { service, userRepository } = makeService(stored);
    userRepository.findOne.mockResolvedValue({ id: 'u2', username: 'taken' });

    await expect(service.update('u1', { username: 'taken' })).rejects.toBeDefined();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
