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
  WalletInput,
  SocialLinksInput,
} from './dto/user.dto';
import { User } from './model/graphql/user.model';
import { UserService } from './user.service';
import { UserSetting } from './model/graphql/user-setting.model';
import { AuthPayload } from '../auth/graphql/models/auth-payload';
import { Logger } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver {
  private readonly logger = new Logger(UserResolver.name);
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
    name: 'updateSocialLinks',
    description: 'Update social links for the current user',
  })
  async updateSocialLinks(
    @CurrentUser('id') userId: string,
    @Args('input', { type: () => SocialLinksInput }) input: SocialLinksInput,
  ): Promise<boolean> {
    return this.userService.updateSocialLinks(userId, input);
  }

  @Mutation(() => Boolean, {
    name: 'updateWallets',
    description: 'Update wallets for the current user',
  })
  async updateWallets(
    @CurrentUser('id') userId: string,
    @Args('wallets', { type: () => [WalletInput] }) wallets: WalletInput[],
  ): Promise<boolean> {
    return this.userService.updateWallets(userId, wallets);
  }

  @Mutation(() => Boolean, {
    name: 'updateStatusText',
    description: 'Update status text for the current user',
  })
  async updateStatusText(
    @CurrentUser('id') userId: string,
    @Args('statusText', { type: () => String }) statusText: string,
  ): Promise<boolean> {
    return this.userService.updateStatusText(userId, statusText);
  }

  @Public()
  @Query(() => User, {
    name: 'getUser',
    description: 'Get user by id',
  })
  async getUser(@Args('userId', { type: () => String }) userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    return User.fromEntity(user);
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

  @Query(() => Boolean, {
    name: 'isFollowing',
    description: 'Auth user is following a userid ',
  })
  async isFollowing(
    @CurrentUser('id') userId: string,
    @Args('followerId', { type: () => String }) followerId: string,
  ): Promise<boolean> {
    if (!followerId) return false;
    return this.userService.isFollowing(userId, followerId);
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