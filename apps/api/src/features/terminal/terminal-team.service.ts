import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DocumentEntity,
  ExecutionScheduleEntity,
  TerminalAnalysisSubjectEntity,
  TerminalBriefingItemEntity,
  TerminalClientEntity,
  TerminalInviteEntity,
  TerminalMemberEntity,
  TerminalRequestEntity,
  TerminalSignalEntity,
} from '@sandworm/postgresql-typeorm';
import {
  ClientStatusId,
  InviteStatusId,
  OPEN_REQUEST_STATUSES,
  SignalStatusId,
  documentPath,
} from '@sandworm/types/terminal';
import type {
  OrganisationTypeId,
  PlanId,
  TeamClientDetail,
  TeamClientDraft,
  TeamClientSource,
  TeamClientSummary,
  TeamSourceRun,
} from '@sandworm/types/terminal';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { NotebookRunService } from '../notebook-blocks/notebook-run.service';
import { StaffService } from '../staff/staff.service';
import { normaliseEmail } from './terminal-invite';

const TEAM_ONLY = 'The terminal team tools are for the Sandworm team';
const MAX_CLIENTS = 500;
// Under the HTTP timeout; a longer run carries on and the next read shows it.
const SOURCE_RUN_WAIT_SECONDS = 40;

type SourceUse = { items: number; cells: number; lastRanAt: Date | null };

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
    @InjectRepository(TerminalMemberEntity)
    private readonly members: Repository<TerminalMemberEntity>,
    @InjectRepository(TerminalBriefingItemEntity)
    private readonly briefing: Repository<TerminalBriefingItemEntity>,
    @InjectRepository(TerminalSignalEntity)
    private readonly signals: Repository<TerminalSignalEntity>,
    @InjectRepository(TerminalAnalysisSubjectEntity)
    private readonly subjects: Repository<TerminalAnalysisSubjectEntity>,
    @InjectRepository(TerminalRequestEntity)
    private readonly requests: Repository<TerminalRequestEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documents: Repository<DocumentEntity>,
    @InjectRepository(ExecutionScheduleEntity)
    private readonly schedules: Repository<ExecutionScheduleEntity>,
    private readonly dataSource: DataSource,
    private readonly staff: StaffService,
    private readonly notebookRuns: NotebookRunService,
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

  // One client with what the team needs to look after it: who reads, what is
  // open, and the notebooks its terminal is built from.
  async getClient(staffId: string, clientId: string): Promise<TeamClientDetail> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const client = await this.clients.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException('No such client');

    const [invite, members, lastRead, openRequests, newSignals, uses] = await Promise.all([
      this.invites.findOne({ where: { clientId }, order: { createdAt: 'ASC' } }),
      this.members.count({ where: { clientId } }),
      this.members
        .createQueryBuilder('member')
        .select('MAX(member.lastSeenBriefingAt)', 'at')
        .where('member.clientId = :clientId', { clientId })
        .getRawOne<{ at: Date | string | null }>(),
      this.requests.count({ where: { clientId, status: In([...OPEN_REQUEST_STATUSES]) } }),
      this.signals.count({ where: { clientId, status: SignalStatusId.NEW } }),
      this.sourceUses(clientId),
    ]);

    return {
      ...toSummary(client, invite?.email ?? null),
      website: client.website,
      description: client.description,
      members,
      lastReadAt: lastRead?.at ? new Date(lastRead.at).toISOString() : null,
      openRequests,
      newSignals,
      researchAllowance: client.researchAllowance,
      sources: await this.sourcesOf(uses),
    };
  }

  // Runs one of the client's notebooks as the staff member, the way pressing
  // Run in the editor does. Only a notebook that feeds this client may be run
  // from its page, and the staff member still needs edit access to it.
  async runSource(staffId: string, clientId: string, documentId: string): Promise<TeamSourceRun> {
    await this.staff.assertStaff(staffId, TEAM_ONLY);

    const uses = await this.sourceUses(clientId);
    if (!uses.has(documentId)) throw new NotFoundException('That notebook does not feed this client');

    const document = await this.documents.findOneBy({ id: documentId });
    if (!document) throw new NotFoundException('That notebook no longer exists');

    const report = await this.notebookRuns.start(
      { userId: staffId, workspaceId: document.workspaceId, documentId },
      { waitSeconds: SOURCE_RUN_WAIT_SECONDS },
    );

    const ran = report.cells.filter((cell) => cell.state === 'success' || cell.state === 'error' || cell.state === 'aborted');
    return {
      status: report.status,
      cells: ran.length,
      failed: ran
        .filter((cell) => cell.state !== 'success')
        .map((cell) => ({
          title: cell.title || cell.kind,
          message: cell.error?.message ?? (cell.state === 'aborted' ? 'Stopped before it finished' : 'Failed'),
        })),
    };
  }

  // Which notebooks feed the client, from what its briefing, signals and
  // analysis point at, and how many cells and items each one feeds.
  private async sourceUses(clientId: string): Promise<Map<string, SourceUse>> {
    const [fromBriefing, fromSignals, fromSubjects] = await Promise.all([
      this.briefing
        .createQueryBuilder('item')
        .select('item.documentId', 'documentId')
        .addSelect('COUNT(*)', 'items')
        .addSelect('COUNT(DISTINCT item.blockId)', 'cells')
        .addSelect('MAX(item.ranAt)', 'lastRanAt')
        .where('item.clientId = :clientId', { clientId })
        .andWhere('item.documentId IS NOT NULL')
        .groupBy('item.documentId')
        .getRawMany<{ documentId: string; items: string; cells: string; lastRanAt: Date | string | null }>(),
      this.signals.find({ select: { documentId: true }, where: { clientId, documentId: Not(IsNull()) } }),
      this.subjects.find({ select: { documentId: true }, where: { clientId, documentId: Not(IsNull()) } }),
    ]);

    const uses = new Map<string, SourceUse>();
    const use = (documentId: string) => {
      const existing = uses.get(documentId);
      if (existing) return existing;
      const created: SourceUse = { items: 0, cells: 0, lastRanAt: null };
      uses.set(documentId, created);
      return created;
    };

    for (const row of fromBriefing) {
      const entry = use(row.documentId);
      entry.items += Number(row.items);
      entry.cells = Math.max(entry.cells, Number(row.cells));
      entry.lastRanAt = row.lastRanAt ? new Date(row.lastRanAt) : null;
    }
    for (const row of [...fromSignals, ...fromSubjects]) use(row.documentId!).items += 1;
    return uses;
  }

  private async sourcesOf(uses: Map<string, SourceUse>): Promise<TeamClientSource[]> {
    const ids = [...uses.keys()];
    if (ids.length === 0) return [];

    const [documents, schedules] = await Promise.all([
      this.documents.find({ where: { id: In(ids) } }),
      this.schedules.find({ where: { documentId: In(ids) } }),
    ]);

    return documents
      .map((document): TeamClientSource => {
        const use = uses.get(document.id)!;
        const own = schedules.filter((schedule) => schedule.documentId === document.id);
        const schedule = own.find((candidate) => candidate.isActive) ?? own[0];
        return {
          documentId: document.id,
          title: document.title,
          path: documentPath(document),
          cells: use.cells,
          items: use.items,
          lastRanAt: use.lastRanAt?.toISOString() ?? null,
          schedule: schedule
            ? {
                isActive: schedule.isActive,
                nextRunAt: schedule.nextExecutionAt?.toISOString() ?? null,
                lastRunAt: schedule.lastExecutedAt?.toISOString() ?? null,
              }
            : null,
        };
      })
      .sort((a, b) => (b.lastRanAt ?? '').localeCompare(a.lastRanAt ?? '') || a.title.localeCompare(b.title));
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
          status: isSendingNow ? ClientStatusId.INVITE_SENT : ClientStatusId.SETTING_UP,
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
          status: isSendingNow ? InviteStatusId.SENT : InviteStatusId.PENDING,
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
      { clientId, status: InviteStatusId.PENDING },
      { status: InviteStatusId.SENT, sentAt: new Date() },
    );
    if (client.status === ClientStatusId.SETTING_UP) {
      client.status = ClientStatusId.INVITE_SENT;
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
