import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DocumentEntity,
  ShowcaseCategoryEntity,
  ShowcaseChainEntity,
  ShowcaseGroupEntity,
  ShowcaseLeadEntity,
} from '@sandworm/postgresql-typeorm';
import { NotebookShowcase } from '@sandworm/types';
import { timingSafeEqual } from 'crypto';
import { In, IsNull, Not, Repository } from 'typeorm';
import { z } from 'zod';
import { WorkspaceMembershipService } from '../workspace/service/workspace-membership.service';

const MAX_NOTEBOOKS = 500;
const MAX_LEADS = 500;

const slug = z
  .string()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers and single dashes',
  )
  .max(80);

export const CategoryInput = z.object({
  slug,
  name: z.string().trim().min(1).max(80),
  groupId: z.string().trim().min(1).max(40),
  question: z.string().trim().min(1).max(300),
  metricSpec: z.string().trim().max(120).nullish(),
  protocols: z.array(z.string().trim().min(1).max(80)).max(60).default([]),
  chains: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  // Left out: the category goes after the others.
  position: z.number().int().min(0).max(100_000).optional(),
});

export const ChainInput = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'A color like #A308F0'),
  position: z.number().int().min(0).max(1_000).nullish(),
});

// Who is asking. The studio lets you in with the shared studio password, or as staff:
// someone who can edit an official workspace, the same people whose notebooks may
// appear on the Showcase at all.
export interface StudioCaller {
  userId?: string;
  password?: string;
}

// What the studio (the team's internal Showcase editor) reads and writes.
@Injectable()
export class ShowcaseAdminService {
  private readonly officialWorkspaceIds: string[];
  private readonly studioPassword: string;

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
    private readonly workspaceMembershipService: WorkspaceMembershipService,
    config: ConfigService,
  ) {
    this.officialWorkspaceIds = (
      config.get<string>('SHOWCASE_OFFICIAL_WORKSPACE_IDS') ?? ''
    )
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    this.studioPassword = config.get<string>('SHOWCASE_STUDIO_PASSWORD') ?? '';
  }

  async assertStaff({ userId, password }: StudioCaller): Promise<void> {
    if (this.passwordMatches(password)) return;
    if (!userId)
      throw new ForbiddenException(
        'The Showcase studio is for the Sandworm team',
      );

    for (const workspaceId of this.officialWorkspaceIds) {
      try {
        await this.workspaceMembershipService.assertCanEdit(
          workspaceId,
          userId,
        );
        return;
      } catch {
        // Not in this one: try the next.
      }
    }
    throw new ForbiddenException(
      'The Showcase studio is for the Sandworm team',
    );
  }

  // An unset password lets nobody in this way.
  private passwordMatches(given?: string): boolean {
    if (!this.studioPassword || !given) return false;
    const a = Buffer.from(given);
    const b = Buffer.from(this.studioPassword);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  // Everything the studio's notebook and lead tabs show. The taxonomy comes from the
  // public config query, the same as the pages read it.
  async getOverview(who: StudioCaller) {
    await this.assertStaff(who);

    const [documents, leads] = await Promise.all([
      this.officialWorkspaceIds.length === 0
        ? []
        : this.documentRepository.find({
            where: {
              workspaceId: In(this.officialWorkspaceIds),
              deletedAt: IsNull(),
            },
            order: { updatedAt: 'DESC' },
            take: MAX_NOTEBOOKS,
          }),
      this.leadRepository.find({
        order: { createdAt: 'DESC' },
        take: MAX_LEADS,
      }),
    ]);

    return {
      officialWorkspaceIds: this.officialWorkspaceIds,
      notebooks: documents.map((doc) => ({
        id: doc.id,
        workspaceId: doc.workspaceId,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        visibility: doc.visibility,
        publishedAt: doc.publishedAt,
        updatedAt: doc.updatedAt,
        showcase: doc.showcase,
      })),
      leads: leads.map((lead) => ({
        id: lead.id,
        kind: lead.kind,
        category: lead.category,
        protocol: lead.protocol,
        email: lead.email,
        company: lead.company,
        notebookSlug: lead.notebookSlug,
        role: lead.role,
        source: lead.source,
        createdAt: lead.createdAt,
      })),
    };
  }

  // Pass null to take a notebook off the Showcase. Only notebooks in the official
  // workspaces can be filed, whoever is asking.
  async saveNotebook(
    who: StudioCaller,
    documentId: string,
    showcase: unknown,
  ): Promise<boolean> {
    await this.assertStaff(who);

    const document = await this.documentRepository.findOne({
      where: {
        id: documentId,
        workspaceId: In(this.officialWorkspaceIds),
        deletedAt: IsNull(),
      },
    });
    if (!document)
      throw new NotFoundException('No such notebook in an official workspace');

    document.showcase =
      showcase === null ? null : this.parse(NotebookShowcase, showcase);
    await this.documentRepository.save(document);
    return true;
  }

  async saveCategory(who: StudioCaller, input: unknown): Promise<boolean> {
    await this.assertStaff(who);
    const category = this.parse(CategoryInput, input);

    if (
      !(await this.groupRepository.findOne({ where: { id: category.groupId } }))
    ) {
      throw new BadRequestException(
        `There is no group called "${category.groupId}"`,
      );
    }

    const existing = await this.categoryRepository.findOne({
      where: { slug: category.slug },
    });
    const position =
      category.position ??
      existing?.position ??
      (await this.categoryRepository.count()) + 1;

    await this.categoryRepository.save(
      this.categoryRepository.create({
        slug: category.slug,
        groupId: category.groupId,
        name: category.name,
        question: category.question,
        metricSpec: category.metricSpec?.trim()
          ? category.metricSpec.trim()
          : null,
        protocols: category.protocols,
        chains: category.chains,
        position,
      }),
    );
    return true;
  }

  // A category with notebooks filed under it is not deleted: they would be left
  // pointing at nothing.
  async deleteCategory(
    who: StudioCaller,
    categorySlug: string,
  ): Promise<boolean> {
    await this.assertStaff(who);

    const filed = await this.countNotebooksIn(categorySlug);
    if (filed > 0) {
      throw new BadRequestException(
        `${filed} notebook${filed === 1 ? ' is' : 's are'} filed under "${categorySlug}". Move or remove ${filed === 1 ? 'it' : 'them'} first`,
      );
    }

    const result = await this.categoryRepository.delete({ slug: categorySlug });
    return (result.affected ?? 0) > 0;
  }

  async saveChain(who: StudioCaller, input: unknown): Promise<boolean> {
    await this.assertStaff(who);
    const chain = this.parse(ChainInput, input);

    await this.chainRepository.save(
      this.chainRepository.create({
        name: chain.name,
        color: chain.color,
        position: chain.position ?? null,
      }),
    );
    return true;
  }

  // Approving a claim is how a case study becomes the protocol team's: the page stops
  // asking to be claimed. The claim itself came in as a lead.
  async approveClaim(who: StudioCaller, leadId: string): Promise<boolean> {
    await this.assertStaff(who);

    const lead = await this.leadRepository.findOne({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('No such lead');
    if (lead.kind !== 'claim' || !lead.notebookSlug) {
      throw new BadRequestException(
        'Only a claim that names a case study can be approved',
      );
    }

    const document = await this.documentRepository.findOne({
      where: {
        slug: lead.notebookSlug,
        workspaceId: In(this.officialWorkspaceIds),
        deletedAt: IsNull(),
        showcase: Not(IsNull()),
      },
    });
    if (!document)
      throw new NotFoundException(
        `No Showcase notebook with the slug "${lead.notebookSlug}"`,
      );

    document.showcase = this.parse(NotebookShowcase, {
      ...document.showcase,
      claimed: true,
    });
    await this.documentRepository.save(document);
    return true;
  }

  private async countNotebooksIn(categorySlug: string): Promise<number> {
    if (this.officialWorkspaceIds.length === 0) return 0;
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.workspace_id IN (:...workspaceIds)', {
        workspaceIds: this.officialWorkspaceIds,
      })
      .andWhere('doc.deletedAt IS NULL')
      .andWhere(`doc.showcase->>'category' = :category`, {
        category: categorySlug,
      })
      .getCount();
  }

  private parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`,
    );
    throw new BadRequestException(problems.join('; '));
  }
}
