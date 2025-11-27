import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { UserEntity, UserSettingEntity, UserFollowsEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../graphql_auth/auth.service';
import { CreateUserInput, GetAllUsersInput, UpdateUserInput } from './dto/user.dto';
import { User } from './model/graphql/user.model';
import { UserSetting } from './model/graphql/user-setting.model';
import { AuthPayload } from '../graphql_auth/models/auth-payload';
import { toGraphQLUserUtils } from "@/utils/models"
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
    
    let foundUser = this.toGraphQLUser(user);
    return { id : user.id, user: foundUser, token: currentUser.token };
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
  
    return this.toGraphQLUser(savedUser);
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

    return this.toGraphQLUser(savedUser);
  }

  async getAllUsers(input: GetAllUsersInput): Promise<User[]> {
    let { limit = 20, offset = 0, sortBy, sortOrder } = input;
  
    const users = await this.userRepository.find({
      take: limit,
      skip: offset,
      relations: ['settings'],
    });
  

    const formattedUsers = users.map(u => this.toGraphQLUser(u));
    formattedUsers.sort((a: any, b: any) => {
      const A = a[sortBy];
      const B = b[sortBy];
      if (typeof A === 'string') return sortOrder === 'ASC'  ? A.localeCompare(B) : B.localeCompare(A);
      return sortOrder === 'ASC' ? A - B : B - A;
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
    
  async getUserFollowersCount(userId: string): Promise<number> {
    return this.usersfollowsRepository.count({ where: { followeeId: userId } }) ?? 0;
  }
    
  async getUserFollowingCount(userId: string): Promise<number> {
    return this.usersfollowsRepository.count({ where: { followerId: userId } }) ?? 0;
  }

  async getUserFollowers(userId: string): Promise<User[]> {
    const relations = await this.usersfollowsRepository.find({
      where: { followeeId: userId },
      relations: ['follower'],
    });
  
    return relations.map(r => this.toGraphQLUser(r.follower));
  }


  async getUserFollowing(userId: string): Promise<User[]> {
    const relations = await this.usersfollowsRepository.find({
      where: { followerId: userId },
      relations: ['followee'],
    });
  
    return relations.map(r => this.toGraphQLUser(r.followee));
  }
  
  

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    await this.userRepository.remove(user);
  }

  private toGraphQLUser(entity: UserEntity): User {
    return  toGraphQLUserUtils(entity);
  }
}
