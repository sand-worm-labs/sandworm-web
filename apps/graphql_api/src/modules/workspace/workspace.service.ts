import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { UserEntity, UserSettingEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { CreateUserInput, UpdateUserInput } from './dto/workspace.dto';
import { User } from './model/workspace.model';
import { AuthPayload } from '../auth/models/auth-payload';
@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserSettingEntity)
    private readonly userSettingRepository: Repository<UserSettingEntity>,
  ) { }

}
