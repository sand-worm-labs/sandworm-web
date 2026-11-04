import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalMemberEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import {
  FIRST_BRIEFING_DAYS,
  type AccessLevelId,
  type OrganisationTypeId,
  type SetupDraft,
  type TerminalSession,
} from '@sandworm/types/terminal';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TerminalService {
  constructor(
    @InjectRepository(TerminalClientEntity)
    private readonly clients: Repository<TerminalClientEntity>,
    @InjectRepository(TerminalMemberEntity)
    private readonly members: Repository<TerminalMemberEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // The setup the user has saved so far, or null before their first save.
  async getSetup(ownerId: string): Promise<SetupDraft | null> {
    const client = await this.clients.findOneBy({ ownerId });
    return client ? toSetup(client) : null;
  }

  // The signed-in user and the client they are a member of (their first, while
  // a user can only be in one). No client before their first setup save.
  async getSession(userId: string): Promise<TerminalSession> {
    const [user, member] = await Promise.all([
      this.users.findOneByOrFail({ id: userId }),
      this.members.findOne({
        where: { userId },
        relations: { client: true },
        order: { createdAt: 'ASC' },
      }),
    ]);
    return {
      user: { name: user.getDisplayName() },
      client: member
        ? {
            name: member.client.name,
            type: member.client.type as OrganisationTypeId,
            access: member.access as AccessLevelId,
          }
        : null,
      firstBriefingDays: FIRST_BRIEFING_DAYS,
    };
  }

  // Creates the client on the first save, with its owner as an admin member.
  async saveSetup(ownerId: string, setup: SetupDraft): Promise<SetupDraft> {
    await this.dataSource.transaction(async (manager) => {
      await manager.upsert(
        TerminalClientEntity,
        {
          ownerId,
          type: setup.organisation.type,
          name: setup.organisation.name,
          website: setup.organisation.website,
          tracking: setup.tracking,
          goals: setup.goals.selected,
          invites: setup.team.invites,
        },
        { conflictPaths: ['ownerId'] },
      );
      const client = await manager.findOneByOrFail(TerminalClientEntity, {
        ownerId,
      });
      await manager
        .createQueryBuilder()
        .insert()
        .into(TerminalMemberEntity)
        .values({
          clientId: client.id,
          userId: ownerId,
          access: 'admin' satisfies AccessLevelId,
        })
        .orIgnore()
        .execute();
    });
    return setup;
  }
}

function toSetup(client: TerminalClientEntity): SetupDraft {
  return {
    organisation: {
      type: client.type as SetupDraft['organisation']['type'],
      name: client.name,
      website: client.website,
    },
    tracking: client.tracking as SetupDraft['tracking'],
    goals: { selected: client.goals as SetupDraft['goals']['selected'] },
    team: { invites: client.invites as SetupDraft['team']['invites'] },
  };
}
