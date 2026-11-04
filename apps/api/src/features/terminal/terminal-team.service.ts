import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TerminalClientEntity,
  TerminalInviteEntity,
} from '@sandworm/postgresql-typeorm';
import type {
  ClientStatusId,
  InviteStatusId,
  OrganisationTypeId,
  PlanId,
  TeamClientDraft,
  TeamClientSummary,
} from '@sandworm/types/terminal';
import { DataSource, In, Repository } from 'typeorm';
import { StaffService } from '../staff/staff.service';
import { normaliseEmail } from './terminal-invite';

const TEAM_ONLY = 'The terminal team tools are for the Sandworm team';
const MAX_CLIENTS = 500;

// The Sandworm team's side of the terminal: setting clients up for them. Every
// method is for staff only; the terminal hides these screens from everyone else
// too, but this is the check that counts.
@Injectable()
export class TerminalTeamService {
  constructor(
    @InjectRepository(TerminalClientEntity)
    private readonly clients: Repository<TerminalClientEntity>,
    @InjectRepository(TerminalInviteEntity)
    private readonly invites: Repository<TerminalInviteEntity>,
    private readonly dataSource: DataSource,
    private readonly staff: StaffService,
  ) {}

  isStaff(userId: string): Promise<boolean> {
    return this.staff.isStaff(userId);
  }

  async listClients(staffId: string): Promise<TeamClientSummary[]> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const clients = await this.clients.find({
      order: { createdAt: 'DESC' },
      take: MAX_CLIENTS,
    });
    const invites = clients.length
      ? await this.invites.find({
          where: { clientId: In(clients.map((client) => client.id)) },
          order: { createdAt: 'ASC' },
        })
      : [];

    return clients.map((client) =>
      toSummary(
        client,
        invites.find((invite) => invite.clientId === client.id)?.email ?? null,
      ),
    );
  }

  // Creates the client with no owner and an invite for its admin. The admin
  // becomes a member the first time they sign in with that email.
  async createClient(
    staffId: string,
    draft: TeamClientDraft,
  ): Promise<TeamClientSummary> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const { details } = draft;
    const email = normaliseEmail(details.adminEmail);
    const isSendingNow = draft.inviteTiming === 'now';

    const client = await this.dataSource.transaction(async (manager) => {
      const created = await manager.save(
        manager.create(TerminalClientEntity, {
          ownerId: null,
          type: details.type,
          name: details.name,
          website: details.website,
          description: details.description,
          plan: details.plan,
          status: isSendingNow ? 'invite_sent' : 'setting_up',
          createdBy: staffId,
          tracking: draft.tracking,
          goals: [],
          invites: [],
          starterIds: draft.starterIds,
          inviteTiming: draft.inviteTiming,
        }),
      );
      await manager.save(
        manager.create(TerminalInviteEntity, {
          clientId: created.id,
          email,
          name: details.adminName,
          access: 'admin',
          status: isSendingNow ? 'sent' : 'pending',
          sentAt: isSendingNow ? new Date() : null,
        }),
      );
      return created;
    });

    return toSummary(client, email);
  }

  // The team has told the admin: the invite counts as sent. (No email goes out
  // yet; the admin just signs in with the invited address.)
  async sendInvite(
    staffId: string,
    clientId: string,
  ): Promise<TeamClientSummary> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const client = await this.clients.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException('No such client');

    await this.invites.update(
      { clientId, status: 'pending' satisfies InviteStatusId },
      { status: 'sent' satisfies InviteStatusId, sentAt: new Date() },
    );
    if (client.status === 'setting_up') {
      client.status = 'invite_sent' satisfies ClientStatusId;
      await this.clients.save(client);
    }

    const invite = await this.invites.findOne({
      where: { clientId },
      order: { createdAt: 'ASC' },
    });
    return toSummary(client, invite?.email ?? null);
  }
}

function toSummary(
  client: TerminalClientEntity,
  adminEmail: string | null,
): TeamClientSummary {
  return {
    id: client.id,
    name: client.name,
    type: client.type as OrganisationTypeId,
    plan: client.plan as PlanId,
    status: client.status as ClientStatusId,
    adminEmail,
    createdAt: client.createdAt.toISOString(),
  };
}
