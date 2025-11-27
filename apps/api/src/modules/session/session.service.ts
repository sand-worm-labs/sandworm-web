import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ValidationException } from '@sandworm/graphql';
import { SessionEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { ErrorCode } from '@/constants/error-code.constant';
import { Session } from './domain/session';
import { UserResponse } from '../user/model/http/user.model';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private toSession(sessionEntity: SessionEntity): Session {
    return {
      id: sessionEntity.id,
      hash: sessionEntity.hash,
      createdAt: sessionEntity.createdAt,
      updatedAt: sessionEntity.updatedAt,
      deletedAt: sessionEntity.deletedAt,
      user: sessionEntity.user
    };
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    return session ? this.toSession(session) : null;
  }

  async create( userId:UserResponse['id'] ): Promise<Session> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new ValidationException(ErrorCode.E002); // User not found
    }

    const newSession = this.sessionRepository.create({
      user,
    });

    const savedSession = await this.sessionRepository.save(newSession);
    return this.toSession(savedSession);
  }

  async update( id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!session) {
      throw new ValidationException(ErrorCode.E002); // Session not found
    }

    const updatedSession = await this.sessionRepository.save({
      ...session,
      ...payload,
    });

    return this.toSession(updatedSession);
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.sessionRepository.softDelete({ id });
  }

  async deleteByUserId(conditions: { userId: UserResponse['id'] }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: conditions.userId },
    });
  }

  async deleteByUserIdWithExclude(conditions:{
    userId: UserResponse['id'],
    excludeSessionId: Session['id']
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: conditions.userId },
      id: Not(conditions.excludeSessionId),
    });
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    return sessions.map(s =>  this.toSession(s));
  }

}