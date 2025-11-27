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
import { AuthService } from '../graphql_auth/auth.service';
import { CreateUserInput, UpdateUserInput, GetAllUsersInput } from './dto/user.dto';
import { User } from './model/graphql/user.model';
import { UserService } from './user.service';
import { UserSetting } from './model/graphql/user-setting.model';
import { AuthPayload } from '../graphql_auth/models/auth-payload';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  // FIX: return type was wrong (should be AuthPayload)
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
    return this.userService.createUser(input);
  }

  @Mutation(() => User, {
    name: 'updateUser',
    description: 'Update current user',
  })
  async updateUser(
    @CurrentUser('id') userId: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.userService.updateUser(userId, input);
  }

  @Public()
  @Query(() => [User], {
    name: 'getAllUsers',
    description: 'Get all users',
  })
  async getAllUsers(
    @Args('input') input: GetAllUsersInput,
  ): Promise<User[]> {
    return this.userService.getAllUsers(input);
  }

  @Public()
  @Query(() => [User], {
    name: 'getUserFollowers',
    description: 'Users who follow a given user',
  })
  async getUserFollowers(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<User[]> {
    return this.userService.getUserFollowers(userId);
  }

  @Public()
  @Query(() => [User], {
    name: 'getUserFollowing',
    description: 'Users that a given user is following',
  })
  async getUserFollowing(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<User[]> {
    return this.userService.getUserFollowing(userId);
  }

  @ResolveField(() => UserSetting, { nullable: true })
  async settings(@Parent() user: User) {
    if (!user.id) return null;
    return this.userService.getUserSettings(user.id);
  }

  @ResolveField(() => [User])
  async followers(@Parent() user: User): Promise<User[]> {
    return this.userService.getUserFollowers(user.id);
  }

  @ResolveField(() => [User])
  async following(@Parent() user: User): Promise<User[]> {
    return this.userService.getUserFollowing(user.id);
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
