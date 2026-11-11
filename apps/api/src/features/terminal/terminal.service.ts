import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalInviteEntity,
  TerminalMemberEntity,
  UserEntity,
} from '@sandworm/postgresql-typeorm';
import {
  FIRST_BRIEFING_DAYS,
  AccessLevelId,
  InviteStatusId,
  type OrganisationTypeId,
  type SetupDraft,
  type TerminalSession,
} from '@sandworm/types/terminal';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { canClaimInvite } from './terminal-invite';

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
  // a user can only be in one). Someone the team invited joins on their first
  // visit. No client otherwise, until their first setup save.
  async getSession(userId: string): Promise<TerminalSession> {
    const user = await this.users.findOneByOrFail({ id: userId });
    const member =
      (await this.findMember(userId)) ?? (await this.claimInvite(user));

    return {
      user: { name: user.getDisplayName() },
      client: member
        ? {
            name: member.client.name,
            type: member.client.type as OrganisationTypeId,
            access: member.access as AccessLevelId,
            icon: member.client.icon,
          }
        : null,
      firstBriefingDays: FIRST_BRIEFING_DAYS,
      needsWelcome: member ? member.welcomedAt === null : false,
    };
  }

  // The welcome shows once: from here on this member has seen it.
  async markWelcomed(userId: string): Promise<boolean> {
    await this.members.update(
      { userId, welcomedAt: IsNull() },
      { welcomedAt: new Date() },
    );
    return true;
  }

  private findMember(userId: string) {
    return this.members.findOne({
      where: { userId },
      relations: { client: true },
      order: { createdAt: 'ASC' },
    });
  }

  // The team invited this email: the person becomes a member, and the client is live.
  private async claimInvite(user: UserEntity) {
    if (!canClaimInvite(user) || !user.email) return null;
    const email = user.email.trim().toLowerCase();

    const clientId = await this.dataSource.transaction(async (manager) => {
      const invite = await manager.findOne(TerminalInviteEntity, {
        where: { email, status: In([InviteStatusId.PENDING, InviteStatusId.SENT]) },
        order: { createdAt: 'ASC' },
      });
      if (!invite) return null;

      await manager
        .createQueryBuilder()
        .insert()
        .into(TerminalMemberEntity)
        .values({
          clientId: invite.clientId,
          userId: user.id,
          access: invite.access,
        })
        .orIgnore()
        .execute();
      await manager.update(
        TerminalInviteEntity,
        { id: invite.id },
        { status: InviteStatusId.CLAIMED, claimedAt: new Date() },
      );
      await manager.update(
        TerminalClientEntity,
        { id: invite.clientId },
        { status: 'live' },
      );
      if (invite.access === AccessLevelId.ADMIN) {
        await manager.update(
          TerminalClientEntity,
          { id: invite.clientId, ownerId: IsNull() },
          { ownerId: user.id },
        );
      }
      return invite.clientId;
    });

    return clientId ? this.findMember(user.id) : null;
  }

  // Creates the client on the first save, with its owner as an admin member.
  async saveSetup(ownerId: string, setup: SetupDraft): Promise<SetupDraft> {
    await this.dataSource.transaction(async (manager) => {
      const before = await manager.findOneBy(TerminalClientEntity, { ownerId });
      await manager.upsert(
        TerminalClientEntity,
        {
          ownerId,
          type: setup.organisation.type,
          name: setup.organisation.name,
          website: setup.organisation.website,
          description: setup.organisation.description,
          tracking: setup.tracking,
          goals: setup.goals.selected,
          invites: setup.team.invites,
          ...(before && changesWhatIsTracked(before, setup) && { trackingChangedAt: new Date() }),
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
          access: AccessLevelId.ADMIN,
        })
        .orIgnore()
        .execute();
    });
    return setup;
  }
}

// Competitors, regions and goals steer the Overview; contracts are the team's to change.
function changesWhatIsTracked(client: TerminalClientEntity, setup: SetupDraft): boolean {
  const tracking = client.tracking as Partial<SetupDraft['tracking']>;
  return (
    JSON.stringify([tracking.competitors, tracking.regions, client.goals]) !==
    JSON.stringify([setup.tracking.competitors, setup.tracking.regions, setup.goals.selected])
  );
}

function toSetup(client: TerminalClientEntity): SetupDraft {
  return {
    organisation: {
      type: client.type as SetupDraft['organisation']['type'],
      name: client.name,
      website: client.website,
      description: client.description,
    },
    tracking: client.tracking as SetupDraft['tracking'],
    goals: { selected: client.goals as SetupDraft['goals']['selected'] },
    team: { invites: client.invites as SetupDraft['team']['invites'] },
  };
}
