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
  SIGNAL_STATUS_IDS,
  analysisTag,
  documentPath,
  type AnalysisReport,
  type AnalysisSubject,
  type RequestData,
  type RequestInput,
  type SignalData,
  type SignalStatusId,
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
const OPEN_REQUEST_STATUSES = ['submitted', 'scoping', 'awaiting_approval', 'in_progress'] as const;

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
    if (member.access === 'view') throw new ForbiddenException('Your access is view only');
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
  // collects the client's reports tagged with it. "New" means published since
  // the member last opened Briefing.
  async getAnalysis(userId: string): Promise<TerminalAnalysis> {
    const member = await this.memberOf(userId);
    if (!member) return { subjects: [] };

    const [subjects, docs] = await Promise.all([
      this.subjects.find({ where: { clientId: member.clientId }, order: { impactSize: 'DESC' } }),
      this.reportsOf(member.clientId),
    ]);

    const lastSeen = member.lastSeenBriefingAt;
    const toReport = (doc: DocumentEntity): AnalysisReport => ({
      id: doc.id,
      title: doc.title,
      line: doc.description ?? '',
      publishedAt: doc.createdAt.toISOString(),
      isNew: !lastSeen || doc.createdAt > lastSeen,
      path: documentPath(doc),
    });

    return {
      subjects: subjects.map((subject): AnalysisSubject => {
        const { view } = subject;
        const own =
          view === 'project'
            ? docs.filter((doc) => doc.parentId === subject.documentId)
            : docs.filter((doc) => doc.tags.includes(analysisTag(view, subject.slug)));
        return {
          id: subject.id,
          view,
          slug: subject.slug,
          name: subject.name,
          kind: subject.kind,
          impact: subject.impact,
          impactSize: subject.impactSize,
          reports: own.map(toReport),
        };
      }),
    };
  }

  // Every report of the client: the children of its project documents, newest first
  private async reportsOf(clientId: string): Promise<DocumentEntity[]> {
    const projects = await this.subjects.find({
      select: { documentId: true },
      where: { clientId, view: 'project', documentId: Not(IsNull()) },
    });
    const parentIds = projects.map((p) => p.documentId!);
    if (!parentIds.length) return [];
    return this.documents.find({
      where: { parentId: In(parentIds), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
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
    const readIds = new Set(reads.map((r) => r.itemId));

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
        isRead: readIds.has(item.id),
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

  async markBriefingRead(userId: string, itemIds: string[]): Promise<boolean> {
    const member = await this.memberOf(userId);
    if (!member || !itemIds.length) return false;
    const items = await this.briefingItems.find({
      select: { id: true },
      where: [
        { id: In(itemIds), clientId: member.clientId, memberId: IsNull() },
        { id: In(itemIds), clientId: member.clientId, memberId: member.id },
      ],
    });
    if (!items.length) return false;
    await this.briefingReads
      .createQueryBuilder()
      .insert()
      .values(items.map((item) => ({ itemId: item.id, memberId: member.id })))
      .orIgnore()
      .execute();
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

  async setSignalStatus(userId: string, signalId: string, status: SignalStatusId): Promise<SignalData> {
    if (!SIGNAL_STATUS_IDS.includes(status)) throw new BadRequestException('Unknown status');
    const member = await this.writerOf(userId);
    const row = await this.signals.findOneBy({ id: signalId, clientId: member.clientId });
    if (!row) throw new NotFoundException('Signal not found');
    row.status = status;
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
        kind: 'research',
        approvedAt: MoreThanOrEqual(yearStart(0)),
        status: Not('declined'),
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
        useCase: input.kind === 'research' ? input.useCase : null,
        about: input.about,
        timing: input.kind === 'research' ? input.timing : null,
        files: input.files,
        status: 'submitted',
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
    if (row.kind !== 'research' || row.status !== 'awaiting_approval' || !row.scope) {
      throw new BadRequestException('This request has no scope waiting for approval');
    }
    const [client, used] = await Promise.all([
      this.clients.findOneByOrFail({ id: member.clientId }),
      this.researchUsed(member.clientId),
    ]);
    if (used >= client.researchAllowance) {
      throw new BadRequestException("This year's research allowance is used up");
    }
    row.status = 'in_progress';
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
        where: { clientId: member.clientId, publishedAt: Not(IsNull()), status: In(['new', 'looking', 'acting']) },
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
