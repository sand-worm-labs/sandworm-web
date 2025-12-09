import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { verifyPassword } from '@sandworm/nest-common';
import {
  UserEntity,
  UserFollowsEntity,
  UserSettingEntity,
} from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { AuthPayload } from '../auth-graphql/models/auth-payload';
import {
  CreateUserInput,
  GetAllUsersInput,
  UpdateUserInput,
} from './dto/user.dto';
import { UserSetting } from './model/graphql/user-setting.model';
import { User } from './model/graphql/user.model';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity)
    private readonly userSettingRepository: Repository<UserSettingEntity>,
    @InjectRepository(UserFollowsEntity)
    private readonly userFollowsRepository: Repository<UserFollowsEntity>,
  ) {}

  async getCurrentUser(currentUser: {
    id: string;
    token: string;
  }): Promise<AuthPayload> {
    const user = await this.userRepository.findOneBy({
      id: currentUser.id,
    });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    const foundUser = User.fromEntity(user);
    
    return { id: user.id, user: foundUser, token: currentUser.token , tokenExpires: Date.now() + 60 * 60 * 1000};
  }

  async create(
    input: CreateUserInput | Partial<UserEntity>,
  ): Promise<UserEntity> {
    const { username, email, password } = input;

    if (username || email) {
      const existingUser = await this.userRepository.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser) {
        throw new ValidationException(ErrorCode.E001);
      }
    }

    const newUser = this.userRepository.create({
      ...input,
      password: password,
    });

    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }

  async update(
    userId: string,
    input: UpdateUserInput | Partial<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    const updatedUser = await this.userRepository.save({
      ...user,
      ...input,
      id: userId,
    });

    return updatedUser;
  }

  async getAllUsers(input: GetAllUsersInput): Promise<UserEntity[]> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = input;
  
    // ✅ Whitelist of allowed sort columns
    const allowedSortColumns = ['createdAt', 'username', 'email', 'firstName', 'lastName'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'createdAt';
  
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.settings', 'settings')
      .orderBy(`user.${safeSortBy}`, sortOrder as 'ASC' | 'DESC')  
      .take(limit)
      .skip(offset);
  
    const users = await queryBuilder.getMany();
    
    return users;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    return user ? user : null;
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'provider'],
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    return user ? user : null;
  }

  async findBySocialIdAndProvider(data: {
    socialId: string;
    provider: string;
  }): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: {
        socialId: data.socialId,
        provider: data.provider,
      },
    });

    return user ? user : null;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await this.findByEmailWithPassword(email);

    if (!user || !user.password) {
      return false;
    }

    return verifyPassword(password, user.password);
  }

  async getUserSettings(userId: string): Promise<UserSetting> {
    const settings = await this.userSettingRepository.findOneBy({ userId });

    if (!settings) {
      throw new ValidationException(ErrorCode.E002);
    }

    return settings;
  }

  async getUserFollowersCount(userId: string): Promise<number> {
    return (
      (await this.userFollowsRepository.count({
        where: { followeeId: userId },
      })) ?? 0
    );
  }

  async getUserFollowingCount(userId: string): Promise<number> {
    return (
      (await this.userFollowsRepository.count({
        where: { followerId: userId },
      })) ?? 0
    );
  }

  async getUserFollowers(userId: string): Promise<UserEntity[]> {
    const relations = await this.userFollowsRepository.find({
      where: { followeeId: userId },
      relations: ['follower'],
    });

    return relations.filter((r) => r.follower).map((r) => r.follower);
  }

  async getUserFollowing(userId: string): Promise<UserEntity[]> {
    const relations = await this.userFollowsRepository.find({
      where: { followerId: userId },
      relations: ['followee'],
    });

    return relations.filter((r) => r.followee).map((r) => r.followee);
  }

  async remove(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    await this.userRepository.softRemove(user);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }
    await this.userRepository.remove(user);
  }
}
