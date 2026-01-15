import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { SessionEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { UserResponse } from '../user/model/http/user.model';
import { Session } from './domain/session';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepository: Repository<SessionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) { }

  private toSession(sessionEntity: SessionEntity): Session {
    const { password, userWorkspaces, ...safeUser } = sessionEntity.user;
    const workspaceRoles = userWorkspaces?.reduce(
      (acc, workspace) => {
        acc[workspace.workspaceId] = { role: workspace.role };
        return acc;
      },
      {} as Record<string, { role: string }>,
    ) ?? {};

    return {
      id: sessionEntity.id,
      hash: sessionEntity.hash,
      createdAt: sessionEntity.createdAt,
      updatedAt: sessionEntity.updatedAt,
      deletedAt: sessionEntity.deletedAt,
      user: { ...safeUser } as UserResponse,
      userWorkspaces: workspaceRoles,
    };
  }

  private parseCookieString(cookieString: string): Record<string, string> {
    return cookieString.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  async validateSessionFromCookies(
    cookies: string | Record<string, string>,
  ): Promise<Session | null> {
    let parsedCookies: Record<string, string>;

    if (typeof cookies === 'string') {
      parsedCookies = this.parseCookieString(cookies);
    } else {
      parsedCookies = cookies;
    }

    const sessionId = parsedCookies['sessionId'] ?? parsedCookies['session_id'];
    const sessionHash =
      parsedCookies['sessionHash'] ?? parsedCookies['session_hash'];

    if (!sessionId || !sessionHash) {
      this.logger.debug('Missing sessionId or sessionHash in cookies');
      return null;
    }

    return this.validateSession(sessionId, sessionHash);
  }

  async validateSessionFromCookiesOrThrow(
    cookies: string | Record<string, string>,
  ): Promise<Session> {
    const session = await this.validateSessionFromCookies(cookies);

    if (!session) {
      throw new ValidationException(ErrorCode.E001);
    }

    return session;
  }

  async validateSession(
    sessionId: string,
    hash: string,
  ): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        hash,
        deletedAt: IsNull(),
      },
      relations: ['user', 'user.userWorkspaces'],
    });

    if (!session) {
      this.logger.debug(`Session validation failed for id: ${sessionId}`);
      return null;
    }

    if (!session.user || session.deletedAt) {
      this.logger.debug(`Session user is deleted for session: ${sessionId}`);
      return null;
    }

    return this.toSession(session);
  }

  private parseCookieString(cookieString: string): Record<string, string> {
    return cookieString.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      },
      {} as Record<string, string>,
    );
  }

  async validateSessionFromCookies(
    cookies: string | Record<string, string>,
  ): Promise<Session | null> {
    let parsedCookies: Record<string, string>;

    if (typeof cookies === 'string') {
      parsedCookies = this.parseCookieString(cookies);
    } else {
      parsedCookies = cookies;
    }

    const sessionId = parsedCookies['sessionId'] ?? parsedCookies['session_id'];
    const sessionHash =
      parsedCookies['sessionHash'] ?? parsedCookies['session_hash'];

    if (!sessionId || !sessionHash) {
      this.logger.debug('Missing sessionId or sessionHash in cookies');
      return null;
    }

    return this.validateSession(sessionId, sessionHash);
  }

  async validateSessionFromCookiesOrThrow(
    cookies: string | Record<string, string>,
  ): Promise<Session> {
    const session = await this.validateSessionFromCookies(cookies);

    if (!session) {
      throw new ValidationException(ErrorCode.E001);
    }

    return session;
  }

  async validateSession(
    sessionId: string,
    hash: string,
  ): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        hash,
        deletedAt: IsNull(),
      },
      relations: ['user', 'user.userWorkspaces'],
    });

    if (!session) {
      this.logger.debug(`Session validation failed for id: ${sessionId}`);
      return null;
    }

    if (!session.user || session.deletedAt) {
      this.logger.debug(`Session user is deleted for session: ${sessionId}`);
      return null;
    }

    return this.toSession(session);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user', 'user.userWorkspaces'],
    });
    return session ? this.toSession(session) : null;
  }

  async findByIdOrThrow(id: string): Promise<Session> {
    const session = await this.findById(id);

    if (!session) {
      throw new ValidationException(ErrorCode.E001);
    }

    return session;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'user.userWorkspaces'],
    });
    return sessions.map((s) => this.toSession(s));
  }

  async findActiveByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        user: { id: userId },
        deletedAt: IsNull(),
      },
      relations: ['user', 'user.userWorkspaces'],
    });
    return sessions.map((s) => this.toSession(s));
  }

  async create(userId: UserResponse['id']): Promise<Session> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userWorkspaces'],
    });

    if (!user) {
      throw new ValidationException(ErrorCode.E002);
    }

    const newSession = this.sessionRepository.create({ user });
    const savedSession = await this.sessionRepository.save(newSession);

    const fullSession = await this.sessionRepository.findOne({
      where: { id: savedSession.id },
      relations: ['user', 'user.userWorkspaces'],
    });

    return this.toSession(fullSession!);
  }

  async update(
    id: Session['id'],
    payload: Partial<Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user', 'user.userWorkspaces'],
    });

    if (!session) {
      throw new ValidationException(ErrorCode.E001);
    }

    await this.sessionRepository.update(id, {
      hash: payload.hash ?? session.hash,
    });

    const fullSession = await this.sessionRepository.findOne({
      where: { id },
      relations: ['user', 'user.userWorkspaces'],
    });

    return this.toSession(fullSession!);
  }

  async updateHash(id: Session['id'], hash: string): Promise<Session> {
    return this.update(id, { hash });
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.sessionRepository.softDelete({ id });
  }

  async deleteByUserId(conditions: {
    userId: UserResponse['id'];
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: conditions.userId },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: UserResponse['id'],
    excludeSessionId: Session['id'],
  }): Promise<void> {
    await this.sessionRepository.softDelete({
      user: { id: conditions.userId },
      id: Not(conditions.excludeSessionId),
    });
  }

  async deleteAllExpired(expirationDate: Date): Promise<number> {
    const result = await this.sessionRepository.softDelete({
      updatedAt: Not(expirationDate),
    });
    return result.affected ?? 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.sessionRepository.count({
      where: {
        user: { id: userId },
        deletedAt: IsNull(),
      },
    });
  }

  async existsById(id: string): Promise<boolean> {
    const count = await this.sessionRepository.count({
      where: { id, deletedAt: IsNull() },
    });
    return count > 0;
  }

  async refreshSession(sessionId: string, currentHash: string): Promise<Session> {
    const session = await this.validateSession(sessionId, currentHash);

    if (!session) {
      throw new ValidationException(ErrorCode.E001);
    }

    const newHash = crypto.randomUUID();
    return this.updateHash(session.id, newHash);
  }
}