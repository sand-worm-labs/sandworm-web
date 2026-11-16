import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DocumentEntity,
  TerminalAnalysisSubjectEntity,
  TerminalBriefingItemEntity,
  TerminalBriefingReadEntity,
  TerminalClientEntity,
  TerminalMemberEntity,
  TerminalRequestEntity,
  TerminalSignalEntity,
} from '@sandworm/postgresql-typeorm';
import {
  BRIEFING_WINDOW_DAYS,
  NEW_REPORT_DAYS,
  OPEN_REQUEST_STATUSES,
  AccessLevelId,
  AnalysisViewKind,
  RequestKindId,
  RequestStatusId,
  SignalDismissReasonId,
  SignalStatusId,
  documentPath,
  type AnalysisReport,
  type AnalysisSubject,
  type RequestData,
  type RequestInput,
  type SignalData,
  type TerminalAnalysis,
  type TerminalBriefing,
  type TerminalCounts,
  type TerminalRequests,
  type TerminalSignals,
} from '@sandworm/types/terminal';
import {
  FindOperator,
  In,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

const DAY = 24 * 60 * 60 * 1000;

type DocRef = Pick<DocumentEntity, 'id' | 'workspaceId' | 'slug'>;

// Briefing, Analysis, Signals and Requests for the client a user belongs to.
// Everything is scoped by the member: a user who is not in a client sees empty
// lists and cannot write. Members with "view" access can read but not request.
@Injectable()
export class TerminalContentService {
  constructor(
    @InjectRepository(TerminalMemberEntity)
    private readonly members: Repository<TerminalMemberEntity>,
    @InjectRepository(TerminalClientEntity)
    private readonly clients: Repository<TerminalClientEntity>,
    @InjectRepository(TerminalAnalysisSubjectEntity)
    private readonly subjects: Repository<TerminalAnalysisSubjectEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documents: Repository<DocumentEntity>,
    @InjectRepository(TerminalBriefingItemEntity)
    private readonly briefingItems: Repository<TerminalBriefingItemEntity>,
    @InjectRepository(TerminalBriefingReadEntity)
    private readonly briefingReads: Repository<TerminalBriefingReadEntity>,
    @InjectRepository(TerminalSignalEntity)
    private readonly signals: Repository<TerminalSignalEntity>,
    @InjectRepository(TerminalRequestEntity)
    private readonly requests: Repository<TerminalRequestEntity>,
  ) {}

  // The user's first client membership, as in TerminalService.getSession
  private memberOf(userId: string): Promise<TerminalMemberEntity | null> {
    return this.members.findOne({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  private async writerOf(userId: string): Promise<TerminalMemberEntity> {
    const member = await this.memberOf(userId);
    if (!member) throw new ForbiddenException('You are not part of a terminal client');
    if (member.access === AccessLevelId.VIEW) throw new ForbiddenException('Your access is view only');
    return member;
  }

  private async docs(ids: (string | null)[]): Promise<Map<string, DocRef>> {
    const wanted = [...new Set(ids.filter((id): id is string => !!id))];
    if (!wanted.length) return new Map();
    const docs = await this.documents.find({
      select: { id: true, workspaceId: true, slug: true },
      where: { id: In(wanted), deletedAt: IsNull() },
    });
    return new Map(docs.map((doc: DocRef) => [doc.id, doc]));
  }

  private async paths(ids: (string | null)[]): Promise<Map<string, string>> {
    const docs = await this.docs(ids);
    return new Map([...docs].map(([id, doc]) => [id, documentPath(doc)]));
  }

  // ── Analysis ────────────────────────────────────────────────────────────

  // A project's reports are the children of its document; a region or sector
  // collects the client's reports tagged with it, under a project or not. "New" means published in the
  // last NEW_REPORT_DAYS days, whatever the member has opened since.
  async getAnalysis(userId: string): Promise<TerminalAnalysis> {
    const member = await this.memberOf(userId);
    if (!member) return { subjects: [] };

    const [subjects, docs] = await Promise.all([
      this.subjects.find({ where: { clientId: member.clientId }, order: { impactSize: 'DESC' } }),
      this.reportsOf(member.clientId),
    ]);

    const newSince = new Date(Date.now() - NEW_REPORT_DAYS * DAY);
    const toReport = (doc: DocumentEntity): AnalysisReport => ({
      id: doc.id,
      title: doc.title,
      line: doc.description ?? '',
      publishedAt: doc.createdAt.toISOString(),
      isNew: doc.createdAt > newSince,
      path: documentPath(doc),
    });

    return {
      subjects: subjects.map((subject): AnalysisSubject => {
        const { view } = subject;
        const own =
          view === 'project'
            ? docs.filter((doc) => doc.parentId === subject.documentId)
            : docs.filter((doc) => doc.tags.includes(subject.id));
        return {
          id: subject.id,
          view,
          name: subject.name,
          icon: subject.icon,
          kind: subject.kind,
          impact: subject.impact,
          impactSize: subject.impactSize,
          reports: own.map(toReport),
        };
      }),
    };
  }

  // Every report of the client, newest first: the children of its project documents,
  // and any document tagged with one of its regions or sectors, so a report about a
  // region needs no project to live under
  private async reportsOf(clientId: string): Promise<DocumentEntity[]> {
    const subjects = await this.subjects.find({ select: { id: true, view: true, documentId: true }, where: { clientId } });
    const parentIds = subjects.filter((s) => s.view === AnalysisViewKind.PROJECT && s.documentId).map((s) => s.documentId!);
    const groupIds = subjects.filter((s) => s.view !== AnalysisViewKind.PROJECT).map((s) => s.id);
    if (!parentIds.length && !groupIds.length) return [];
    return this.documents
      .createQueryBuilder('doc')
      .where('doc.deletedAt IS NULL')
      .andWhere('(doc.parentId = ANY(:parentIds::uuid[]) OR doc.tags && :groupIds::text[])', { parentIds, groupIds })
      .orderBy('doc.createdAt', 'DESC')
      .getMany();
  }

  // ── Briefing ────────────────────────────────────────────────────────────

  // Published items for the whole client or for this member, from the last
  // BRIEFING_WINDOW_DAYS. Older ones only count toward archivedCount.
  async getBriefing(userId: string): Promise<TerminalBriefing> {
    const member = await this.memberOf(userId);
    if (!member) return { lastSeenAt: null, items: [], archivedCount: 0 };

    const since = new Date(Date.now() - BRIEFING_WINDOW_DAYS * DAY);
    // Items for the whole client, or for this member only. LessThan also skips drafts (null).
    const visible = (publishedAt: FindOperator<Date>) => [
      { clientId: member.clientId, memberId: IsNull(), publishedAt },
      { clientId: member.clientId, memberId: member.id, publishedAt },
    ];

    const [items, archivedCount] = await Promise.all([
      this.briefingItems.find({
        where: visible(MoreThanOrEqual(since)),
        order: { publishedAt: 'DESC' },
      }),
      this.briefingItems.count({ where: visible(LessThan(since)) }),
    ]);

    const [reads, docs, outputs] = await Promise.all([
      items.length
        ? this.briefingReads.find({ where: { memberId: member.id, itemId: In(items.map((i) => i.id)) } })
        : Promise.resolve([]),
      this.docs(items.map((i) => i.documentId)),
      this.briefingOutputs(items.map((i) => i.id)),
    ]);
    const states = new Map(reads.map((r) => [r.itemId, r]));

    return {
      lastSeenAt: member.lastSeenBriefingAt?.toISOString() ?? null,
      archivedCount,
      items: items.map((item) => ({
        id: item.id,
        kind: item.kind,
        title: item.title,
        summary: item.summary,
        subject: item.subject,
        // The snapshot of the cell's outputs sits in its own column; the client reads it from detail
        detail: { ...item.detail, ...(outputs.get(item.id)?.length ? { outputs: outputs.get(item.id) } : {}) } as Record<string, unknown>,
        publishedAt: item.publishedAt!.toISOString(),
        isRead: states.has(item.id),
        isArchived: !!states.get(item.id)?.archivedAt,
        // The cell the item was made from, inside its notebook
        sourcePath: sourceOf(docs, item.documentId, item.blockId),
      })),
    };
  }

  // outputs is not selected by default (it can be large), so it is read for the items shown
  private async briefingOutputs(itemIds: string[]): Promise<Map<string, unknown[]>> {
    if (!itemIds.length) return new Map();
    const rows = await this.briefingItems
      .createQueryBuilder('item')
      .select('item.id')
      .addSelect('item.outputs')
      .whereInIds(itemIds)
      .getMany();
    return new Map(rows.map((row) => [row.id, row.outputs]));
  }

  // The briefing items among `itemIds` that are the member's to act on: their client's, or theirs alone
  private async ownBriefingItemIds(member: TerminalMemberEntity, itemIds: string[]): Promise<string[]> {
    const items = await this.briefingItems.find({
      select: { id: true },
      where: [
        { id: In(itemIds), clientId: member.clientId, memberId: IsNull() },
        { id: In(itemIds), clientId: member.clientId, memberId: member.id },
      ],
    });
    return items.map((item) => item.id);
  }

  async markBriefingRead(userId: string, itemIds: string[]): Promise<boolean> {
    const member = await this.memberOf(userId);
    if (!member || !itemIds.length) return false;
    const ids = await this.ownBriefingItemIds(member, itemIds);
    if (!ids.length) return false;
    await this.briefingReads
      .createQueryBuilder()
      .insert()
      .values(ids.map((itemId) => ({ itemId, memberId: member.id })))
      .orIgnore()
      .execute();
    return true;
  }

  // Unread again, and out of the archive: the read row is what makes an item either
  async markBriefingUnread(userId: string, itemIds: string[]): Promise<boolean> {
    const member = await this.memberOf(userId);
    if (!member || !itemIds.length) return false;
    await this.briefingReads.delete({ memberId: member.id, itemId: In(itemIds) });
    return true;
  }

  // Archiving reads the item too; taking it out of the archive leaves it read
  async setBriefingArchived(userId: string, itemIds: string[], isArchived: boolean): Promise<boolean> {
    const member = await this.memberOf(userId);
    if (!member || !itemIds.length) return false;
    const ids = await this.ownBriefingItemIds(member, itemIds);
    if (!ids.length) return false;
    if (isArchived) {
      const archivedAt = new Date();
      await this.briefingReads
        .createQueryBuilder()
        .insert()
        .values(ids.map((itemId) => ({ itemId, memberId: member.id, archivedAt })))
        .orUpdate(['archived_at'], ['item_id', 'member_id'])
        .execute();
    } else {
      await this.briefingReads.update({ memberId: member.id, itemId: In(ids) }, { archivedAt: null });
    }
    return true;
  }

  async markBriefingSeen(userId: string): Promise<boolean> {
    const member = await this.memberOf(userId);
    if (!member) return false;
    await this.members.update(member.id, { lastSeenBriefingAt: new Date() });
    return true;
  }

  // ── Signals ─────────────────────────────────────────────────────────────

  async getSignals(userId: string): Promise<TerminalSignals> {
    const member = await this.memberOf(userId);
    if (!member) return { items: [] };
    const rows = await this.signals.find({
      where: { clientId: member.clientId, publishedAt: Not(IsNull()) },
      order: { publishedAt: 'DESC' },
    });
    const paths = await this.paths(rows.map((r) => r.documentId));
    return { items: rows.map((row) => toSignal(row, paths)) };
  }

  // A reason goes with "dismissed" and is cleared when the signal comes back
  async setSignalStatus(
    userId: string,
    signalId: string,
    status: SignalStatusId,
    reason?: SignalDismissReasonId,
  ): Promise<SignalData> {
    if (!Object.values(SignalStatusId).includes(status)) throw new BadRequestException('Unknown status');
    if (status === SignalStatusId.NEW) throw new BadRequestException('A signal starts as new');
    if (reason && !Object.values(SignalDismissReasonId).includes(reason)) throw new BadRequestException('Unknown reason');
    const member = await this.writerOf(userId);
    const row = await this.signals.findOneBy({ id: signalId, clientId: member.clientId });
    if (!row) throw new NotFoundException('Signal not found');
    row.status = status;
    row.dismissReason = status === SignalStatusId.DISMISSED ? (reason ?? null) : null;
    await this.signals.save(row);
    return toSignal(row, await this.paths([row.documentId]));
  }

  async setSignalFeedback(userId: string, signalId: string, feedback: string): Promise<SignalData> {
    const text = feedback.trim();
    if (text.length > 2000) throw new BadRequestException('Feedback is too long');
    const member = await this.writerOf(userId);
    const row = await this.signals.findOneBy({ id: signalId, clientId: member.clientId });
    if (!row) throw new NotFoundException('Signal not found');
    row.feedback = text;
    await this.signals.save(row);
    return toSignal(row, await this.paths([row.documentId]));
  }

  // ── Requests ────────────────────────────────────────────────────────────

  async getRequests(userId: string): Promise<TerminalRequests> {
    const member = await this.memberOf(userId);
    if (!member) {
      return { allowance: { used: 0, total: 0, resetsAt: yearStart(1).toISOString() }, requests: [] };
    }
    const [client, rows, used] = await Promise.all([
      this.clients.findOneByOrFail({ id: member.clientId }),
      this.requests.find({
        where: { clientId: member.clientId },
        relations: { requester: { user: true } },
        order: { submittedAt: 'DESC' },
      }),
      this.researchUsed(member.clientId),
    ]);
    const paths = await this.paths(rows.map((r) => r.reportId));

    return {
      allowance: { used, total: client.researchAllowance, resetsAt: yearStart(1).toISOString() },
      requests: rows.map((row) => toRequest(row, paths)),
    };
  }

  // Research approved this calendar year and not declined
  private researchUsed(clientId: string): Promise<number> {
    return this.requests.count({
      where: {
        clientId,
        kind: RequestKindId.RESEARCH,
        approvedAt: MoreThanOrEqual(yearStart(0)),
        status: Not(RequestStatusId.DECLINED),
      },
    });
  }

  // A new request starts at "submitted"; Sandworm's agents pick it up from there.
  async submitRequest(userId: string, input: RequestInput): Promise<RequestData> {
    const member = await this.writerOf(userId);
    const row = await this.requests.save(
      new TerminalRequestEntity({
        clientId: member.clientId,
        kind: input.kind,
        requestedBy: member.id,
        question: input.question.trim(),
        useCase: input.kind === RequestKindId.RESEARCH ? input.useCase : null,
        about: input.about,
        timing: input.kind === RequestKindId.RESEARCH ? input.timing : null,
        files: input.files,
        status: RequestStatusId.SUBMITTED,
      }),
    );
    const saved = await this.requests.findOneOrFail({
      where: { id: row.id },
      relations: { requester: { user: true } },
    });
    return toRequest(saved, new Map());
  }

  // Approving a scope starts the work and uses one research from the allowance.
  async approveRequestScope(userId: string, requestId: string): Promise<RequestData> {
    const member = await this.writerOf(userId);
    const row = await this.requests.findOne({
      where: { id: requestId, clientId: member.clientId },
      relations: { requester: { user: true } },
    });
    if (!row) throw new NotFoundException('Request not found');
    if (row.kind !== RequestKindId.RESEARCH || row.status !== RequestStatusId.AWAITING_APPROVAL || !row.scope) {
      throw new BadRequestException('This request has no scope waiting for approval');
    }
    const [client, used] = await Promise.all([
      this.clients.findOneByOrFail({ id: member.clientId }),
      this.researchUsed(member.clientId),
    ]);
    if (used >= client.researchAllowance) {
      throw new BadRequestException("This year's research allowance is used up");
    }
    row.status = RequestStatusId.IN_PROGRESS;
    row.approvedAt = new Date();
    row.approvedBy = member.id;
    await this.requests.save(row);
    return toRequest(row, await this.paths([row.reportId]));
  }

  // ── Counts ──────────────────────────────────────────────────────────────

  async getCounts(userId: string): Promise<TerminalCounts> {
    const member = await this.memberOf(userId);
    if (!member) return { briefing: 0, analysis: 0, signals: 0, requests: 0 };

    const since = new Date(Date.now() - BRIEFING_WINDOW_DAYS * DAY);
    const [briefing, reports, signals, requests] = await Promise.all([
      this.briefingItems
        .createQueryBuilder('item')
        .leftJoin(TerminalBriefingReadEntity, 'read', 'read.item_id = item.id AND read.member_id = :memberId', { memberId: member.id })
        .where('item.client_id = :clientId', { clientId: member.clientId })
        .andWhere('(item.member_id IS NULL OR item.member_id = :memberId)', { memberId: member.id })
        .andWhere('item.published_at >= :since', { since })
        .andWhere('read.item_id IS NULL')
        .getCount(),
      this.reportsOf(member.clientId),
      this.signals.count({
        where: { clientId: member.clientId, publishedAt: Not(IsNull()), status: In([SignalStatusId.NEW, SignalStatusId.LOOKING, SignalStatusId.ACTING]) },
      }),
      this.requests.count({ where: { clientId: member.clientId, status: In([...OPEN_REQUEST_STATUSES]) } }),
    ]);

    return { briefing, analysis: reports.length, signals, requests };
  }
}

function sourceOf(docs: Map<string, DocRef>, documentId: string | null, blockId: string): string | null {
  const doc = documentId ? docs.get(documentId) : undefined;
  return doc ? documentPath(doc, blockId) : null;
}

// 1 January of this year (offset 0) or of the next (offset 1), UTC
function yearStart(offset: number): Date {
  return new Date(Date.UTC(new Date().getUTCFullYear() + offset, 0, 1));
}

function toSignal(row: TerminalSignalEntity, paths: Map<string, string>): SignalData {
  return {
    id: row.id,
    status: row.status,
    title: row.title,
    observed: row.observed,
    couldMean: row.couldMean,
    kind: row.kind,
    size: row.size,
    sizeLabel: row.sizeLabel,
    evidence: row.evidence,
    feedback: row.feedback,
    dismissReason: row.dismissReason,
    detail: row.detail,
    subject: row.subject,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    reportPath: (row.documentId && paths.get(row.documentId)) || null,
  };
}

function toRequest(row: TerminalRequestEntity, paths: Map<string, string>): RequestData {
  return {
    id: row.id,
    kind: row.kind,
    question: row.question,
    status: row.status,
    useCase: row.useCase,
    about: row.about,
    timing: row.timing,
    requestedBy: row.requester?.user?.getDisplayName() ?? null,
    scope: row.scope,
    progressNote: row.progressNote,
    outcome: row.outcome,
    reportPath: (row.reportId && paths.get(row.reportId)) || null,
    submittedAt: row.submittedAt.toISOString(),
    scopedAt: row.scopedAt?.toISOString() ?? null,
    approvedAt: row.approvedAt?.toISOString() ?? null,
    closedAt: row.closedAt?.toISOString() ?? null,
  };
}
