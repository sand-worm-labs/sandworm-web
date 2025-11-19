import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput, UpdateUserInput, GetAllUsersInput } from './dto/workspace.dto';
import { User } from './model/workspace.model';
import { WorkspaceService } from './workspace.service';
import { AuthPayload } from '../auth/models/auth-payload';

@Resolver(() => User)
export class WorkspaceResolver {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly authService: AuthService,
  ) { }

}
