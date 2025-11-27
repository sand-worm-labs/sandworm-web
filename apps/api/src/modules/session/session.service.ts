import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ValidationException } from '@sandworm/graphql';
import { SessionEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { ErrorCode } from '@/constants/error-code.constant';
import { CreateSessionInput, UpdateSessionInput } from './dto/session.dto';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<SessionEntity | null> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return session ? session : null;
  }

  async create(input: CreateSessionInput): Promise<SessionEntity> {
    const user = await this.userRepository.findOneBy({ id: input.userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002); // User not found
    }

    const newSession = this.sessionRepository.create({
      user,
      hash: input.hash,
    });

    const savedSession = await this.sessionRepository.save(newSession);
    return savedSession;
  }

  async update(id: string, input: UpdateSessionInput): Promise<SessionEntity> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!session) {
      throw new ValidationException(ErrorCode.E002); // SessionEntity not found
    }

    const updatedSession = await this.sessionRepository.save({
      ...session,
      ...input,
    });

    return updatedSession;
  }

  async deleteById(id: string): Promise<void> {
    await this.sessionRepository.softDelete({ id });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: userId },
    });
  }

  async deleteByUserIdWithExclude(
    userId: string,
    excludeSessionId: string,
  ): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: userId },
      id: Not(excludeSessionId),
    });
  }

  async findByUserId(userId: string): Promise<SessionEntity[]> {
    const sessions = await this.sessionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return sessions.map(s => s);
  }

}