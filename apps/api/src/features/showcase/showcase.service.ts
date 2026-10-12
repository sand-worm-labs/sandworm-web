import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SEARCH_INDEX_STALE_EVENT } from '@/features/search/search.events';
import {
  DocumentEntity,
  DocumentVisibility,
  ShowcaseCategoryEntity,
  ShowcaseChainEntity,
  ShowcaseGroupEntity,
  ShowcaseLeadEntity,
  ShowcaseTemplateEntity,
} from '@sandworm/postgresql-typeorm';
import { NotebookShowcase, ShowcaseLeadInput, type ShowcaseKind } from '@sandworm/types';
import { ErrorCode } from '@/constants/error-code.constant';
import { ValidationException } from '@sandworm/graphql';
import { In, IsNull, Not, Repository } from 'typeorm';
import type { ZodType } from 'zod';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';
import { ShowcaseCommunityModel, ShowcaseNotebookModel } from './showcase.model';

const COMMUNITY_LIMIT = 24;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type ShowcaseConfig = {
  taxonomy: {
    groups: { id: string; label: string }[];
    chainOrder: string[];
    categories: {
      group: string;
      slug: string;
      name: string;
      question: string;
      metricSpec?: string;
      protocols: string[];
      chains: string[];
    }[];
  };
  chains: Record<string, { color: string }>;
  templates: Record<string, { sections: Record<string, unknown>[] }>;
};

// The Showcase is built from notebook metadata. A notebook is on it when it
// is published, carries Showcase metadata marked published, and lives in one
// of the official workspaces (SHOWCASE_OFFICIAL_WORKSPACE_IDS). Anyone can
// tag their own notebook, so the workspace is what makes one official.
@Injectable()
export class ShowcaseService {
  private readonly officialWorkspaceIds: string[];

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(ShowcaseLeadEntity)
    private readonly leadRepository: Repository<ShowcaseLeadEntity>,
    @InjectRepository(ShowcaseGroupEntity)
    private readonly groupRepository: Repository<ShowcaseGroupEntity>,
    @InjectRepository(ShowcaseCategoryEntity)
    private readonly categoryRepository: Repository<ShowcaseCategoryEntity>,
    @InjectRepository(ShowcaseChainEntity)
    private readonly chainRepository: Repository<ShowcaseChainEntity>,
    @InjectRepository(ShowcaseTemplateEntity)
    private readonly templateRepository: Repository<ShowcaseTemplateEntity>,
    private readonly workspaceMembershipService: WorkspaceMembershipService,
    config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.officialWorkspaceIds = (config.get<string>('SHOWCASE_OFFICIAL_WORKSPACE_IDS') ?? '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);
  }

  async listNotebooks(filter: { category?: string; kind?: ShowcaseKind } = {}): Promise<ShowcaseNotebookModel[]> {
    if (this.officialWorkspaceIds.length === 0) return [];

    const query = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.workspace_id IN (:...workspaceIds)', { workspaceIds: this.officialWorkspaceIds })
      .andWhere('doc.visibility = :visibility', { visibility: DocumentVisibility.PUBLIC })
      .andWhere('doc.deletedAt IS NULL')
      .andWhere('doc.publishedAt IS NOT NULL')
      .andWhere('doc.slug IS NOT NULL')
      .andWhere(`doc.showcase->>'status' = 'published'`);

    if (filter.category) query.andWhere(`doc.showcase->>'category' = :category`, { category: filter.category });
    if (filter.kind) query.andWhere(`doc.showcase->>'kind' = :kind`, { kind: filter.kind });

    const documents = await query.orderBy('doc.publishedAt', 'DESC').getMany();
    const withDashboard = await this.withDashboard(documents.map(doc => doc.id));
    return documents.map(doc => ShowcaseNotebookModel.fromEntity(doc, 'official', withDashboard.has(doc.id)));
  }

  // Which of these notebooks have a dashboard their author left public. The published copy
  // records whether it has one (has_dashboard, set when the notebook is published).
  private async withDashboard(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows: { id: string }[] = await this.documentRepository.query(
      `SELECT d.id::text AS id
         FROM document d
         JOIN yjs_app_document a ON a.document_id = d.id AND a.has_dashboard
        WHERE d.id::text = ANY($1::text[]) AND d."isDashboardPublic"`,
      [ids],
    );
    return new Set(rows.map(row => row.id));
  }

  // What the community has published about a category: public notebooks outside the
  // official workspaces whose tags, title or description name the category or one of its
  // chains. Ranked as search ranks them: forks, with featured notebooks on top.
  async listCommunity(category: string, limit = COMMUNITY_LIMIT): Promise<ShowcaseCommunityModel[]> {
    const entry = await this.categoryRepository.findOne({ where: { slug: category } });
    if (!entry) return [];

    const terms = Array.from(
      new Set([entry.slug, entry.name, ...entry.chains].map(term => term.trim().toLowerCase()).filter(Boolean)),
    );
    // A whole word, so "monad" finds Monad but not "monadic".
    const pattern = `\\m(${terms.map(escapeRegex).join('|')})\\M`;

    const rows: (Omit<ShowcaseCommunityModel, 'forks'> & { forks: number | string })[] =
      await this.documentRepository.query(
        `SELECT d.id, d.slug, d.title, d.description, d."publishedAt" AS "publishedAt", d.tags,
                (d."isDashboardPublic" AND EXISTS (
                   SELECT 1 FROM yjs_app_document a WHERE a.document_id = d.id AND a.has_dashboard
                )) AS "hasDashboard",
                coalesce(f.forks, 0)::int AS forks,
                coalesce(nullif(u.full_name, ''), u.username) AS "authorName",
                u.username AS "authorUsername"
           FROM document d
           LEFT JOIN users u ON u.id = d.author_id
           LEFT JOIN (
             SELECT source_document_id, count(*) AS forks FROM document_fork GROUP BY source_document_id
           ) f ON f.source_document_id = d.id
          WHERE d.visibility = 'PUBLIC'
            AND d.deleted_at IS NULL
            AND d."publishedAt" IS NOT NULL
            AND d.slug IS NOT NULL
            AND NOT (d.workspace_id::text = ANY($1::text[]))
            AND (
              EXISTS (SELECT 1 FROM unnest(d.tags) AS tag WHERE lower(tag) = ANY($2::text[]))
              OR d.title ~* $3
              OR d.description ~* $3
            )
          ORDER BY (coalesce(f.forks, 0) + CASE WHEN d."featuredDocument" THEN 5 ELSE 0 END) DESC,
                   d."publishedAt" DESC
          LIMIT $4`,
        [this.officialWorkspaceIds, terms, pattern, Math.min(Math.max(limit, 1), COMMUNITY_LIMIT)],
      );

    return rows.map(row => ({ ...row, forks: Number(row.forks) }));
  }

  // Everything the Showcase pages are laid out from: the groups and their
  // categories, the chains and their order, and each template's sections.
  async getConfig(): Promise<ShowcaseConfig> {
    const [groups, categories, chains, templates] = await Promise.all([
      this.groupRepository.find({ order: { position: 'ASC' } }),
      this.categoryRepository.find({ order: { position: 'ASC' } }),
      this.chainRepository.find({ order: { name: 'ASC' } }),
      this.templateRepository.find(),
    ]);

    const ordered = chains
      .filter(chain => chain.position !== null)
      .sort((a, b) => a.position! - b.position!);

    return {
      taxonomy: {
        groups: groups.map(({ id, label }) => ({ id, label })),
        chainOrder: ordered.map(chain => chain.name),
        categories: categories.map(category => ({
          group: category.groupId,
          slug: category.slug,
          name: category.name,
          question: category.question,
          ...(category.metricSpec ? { metricSpec: category.metricSpec } : {}),
          protocols: category.protocols,
          chains: category.chains,
        })),
      },
      chains: Object.fromEntries(chains.map(chain => [chain.name, { color: chain.color }])),
      templates: Object.fromEntries(templates.map(template => [template.kind, { sections: template.sections }])),
    };
  }

  // Pass null to take a notebook off the Showcase.
  async setShowcase(documentId: string, workspaceId: string, userId: string, showcase: unknown): Promise<boolean> {
    await this.workspaceMembershipService.assertCanEdit(workspaceId, userId);

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: IsNull() },
    });
    if (!document) throw new ValidationException(ErrorCode.E003);

    document.showcase = showcase === null ? null : this.parse(NotebookShowcase, showcase);
    await this.documentRepository.save(document);
    this.eventEmitter.emit(SEARCH_INDEX_STALE_EVENT);
    return true;
  }

  async createLead(input: unknown, userId?: string): Promise<boolean> {
    const lead = this.parse(ShowcaseLeadInput, input);
    await this.leadRepository.save(
      this.leadRepository.create({
        kind: lead.kind,
        category: lead.category ?? null,
        protocol: lead.protocol.trim(),
        email: lead.email ?? null,
        company: lead.company ?? null,
        notebookSlug: lead.notebookSlug ?? null,
        role: lead.role ?? null,
        source: lead.source ?? null,
        userId: userId ?? null,
      }),
    );
    return true;
  }

  private parse<T>(schema: ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    const problems = result.error.issues.map(issue => `${issue.path.join('.') || 'value'}: ${issue.message}`);
    throw new BadRequestException(problems.join('; '));
  }
}
