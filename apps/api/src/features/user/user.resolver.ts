import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import {
  CreateUserInput,
  UpdateUserInput,
  GetAllUsersInput,
  UpdateUserSettingInput,
} from './dto/user.dto';
import { User } from './model/graphql/user.model';
import { UserService } from './user.service';
import { UserSetting } from './model/graphql/user-setting.model';
import { AuthPayload } from '../auth/graphql/models/auth-payload';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) { }

  @Query(() => AuthPayload, {
    name: 'currentUser',
    description: 'Get current user (from token)',
  })
  async currentUser(
    @CurrentUser() user: { id: string; token: string },
  ): Promise<AuthPayload> {
    return this.userService.getCurrentUser(user);
  }

  @Public()
  @Mutation(() => User, {
    name: 'createUser',
    description: 'Register new user',
  })
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    const createdUser = await this.userService.create(input);
    return User.fromEntity(createdUser);
  }

  @Mutation(() => User, {
    name: 'updateUser',
    description: 'Update current user',
  })
  async updateUser(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    const updatedUser = await this.userService.update(userId, input);
    return User.fromEntity(updatedUser);
  }

  @Mutation(() => Boolean, {
    name: 'updateUserSettings',
    description: 'Update user settings',
  })
  async updateUserSettings(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateUserSettingInput,
  ): Promise<boolean> {
    const inputWithDefaults = {
      wallets: input.wallets ?? [],
      socialLinks: input.socialLinks ?? {},
      ...input,
    };
    await this.userService.updateUserSettings(userId, inputWithDefaults);
    return true;
  }

  @Public()
  @Query(() => Int, {
    name: 'getAllUsers',
    description: 'Get all users',
  })
  async getAllUsers(@Args('input') input: GetAllUsersInput): Promise<number> {
    const users = await this.userService.getAllUsers(input);
    return users.length;
  }

  @Public()
  @Query(() => [User], {
    name: 'getUserFollowers',
    description: 'Users who follow a given user',
  })
  async getUserFollowers(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<User[]> {
    const followers = await this.userService.getUserFollowers(userId);
    return User.fromEntities(followers);
  }

  @Public()
  @Query(() => [User], {
    name: 'getUserFollowing',
    description: 'Users that a given user is following',
  })
  async getUserFollowing(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<User[]> {
    const following = await this.userService.getUserFollowing(userId);
    return User.fromEntities(following);
  }

  @ResolveField(() => UserSetting, { nullable: true })
  async settings(@Parent() user: User) {
    if (!user.id) return null;
    return this.userService.getUserSettings(user.id);
  }

  @ResolveField(() => [User])
  async followers(@Parent() user: User): Promise<User[]> {
    const followers = await this.userService.getUserFollowers(user.id);
    return User.fromEntities(followers);
  }

  @ResolveField(() => [User])
  async following(@Parent() user: User): Promise<User[]> {
    const following = await this.userService.getUserFollowing(user.id);
    return User.fromEntities(following);
  }

  @ResolveField(() => Int, { name: 'followersCount' })
  async followersCount(@Parent() user: User): Promise<number> {
    return await this.userService.getUserFollowersCount(user.id);
  }

  @ResolveField(() => Int, { name: 'followingCount' })
  async followingCount(@Parent() user: User): Promise<number> {
    return await this.userService.getUserFollowingCount(user.id);
  }
}