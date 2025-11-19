import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { UserEntity, UserSettingEntity, UserFollowsEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput, GetAllUsersInput, UpdateUserInput } from './dto/user.dto';
import { User } from './model/user.model';
import { UserSetting } from './model/user-setting.model';
import { AuthPayload } from '../auth/models/auth-payload';
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity)
    private readonly userSettingRepository: Repository<UserSettingEntity>,
    @InjectRepository(UserFollowsEntity)
    private readonly usersfollowsRepository: Repository<UserFollowsEntity>,
  ) { }

  async getCurrentUser(currentUser: { id: string; token: string }): Promise<AuthPayload> {
    const user = await this.userRepository.findOneByOrFail({
      id: currentUser.id,
    });

    return { id : user.id, user: { ...user, followersCount: 0, followingCount: 0}, token: currentUser.token };
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const { username, email, password } = input;

    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (user) {
      throw new ValidationException(ErrorCode.E001);
    }

    const newUser = this.userRepository.create({ username, email, password });
    const savedUser = await this.userRepository.save(newUser);

    return {...savedUser, followersCount:0, followingCount:0};
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    const savedUser = await this.userRepository.save({
      id: userId,
      ...input,
    });

    return {
      ...user,
      ...savedUser,
      followersCount: 0,
      followingCount: 0
    };
  }

  async getAllUsers(
   input: GetAllUsersInput
  ): Promise<User[]> {
   let { limit = 20,offset = 0, sortBy, sortOrder} = input;
    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
    });
  
    // Map to GraphQL User type with placeholder counts
    const formattedUsers = await Promise.all(
      users.map(async user => ({
        ...user,
        followersCount: await this.getFollowersCount(user.id),
        followingCount: await this.getFollowingCount(user.id),
      })),
    );
  
    // Sort by requested field
    formattedUsers.sort((a, b) => {
      if (sortOrder === 'ASC') return (a as any)[sortBy] - (b as any)[sortBy];
      return (b as any)[sortBy] - (a as any)[sortBy];
    });
  
    return formattedUsers;
  }

  async getUserSettings(userId: string): Promise<UserSetting> {
    const settings = await this.userSettingRepository.findOneBy({ userId });
    if (!settings) {
      throw new ValidationException(ErrorCode.E002);
    }

    return settings;
  }
    
  async getFollowersCount(userId: string): Promise<number> {
    return this.usersfollowsRepository.count({ where: { followeeId: userId } }) ?? 0;
  }
    
  async getFollowingCount(userId: string): Promise<number> {
    return this.usersfollowsRepository.count({ where: { followerId: userId } }) ?? 0;
  }
  

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    await this.userRepository.remove(user);
  }
}
