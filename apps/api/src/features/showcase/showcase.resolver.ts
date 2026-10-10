import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import type { ShowcaseKind } from '@sandworm/types';
import { GraphQLJSON } from 'graphql-type-json';
import { ShowcaseAdminService } from './showcase-admin.service';
import { ShowcaseNotebookModel } from './showcase.model';
import { ShowcaseService, type ShowcaseConfig } from './showcase.service';

@Resolver()
export class ShowcaseResolver {
  constructor(
    private readonly showcaseService: ShowcaseService,
    private readonly adminService: ShowcaseAdminService,
  ) {}

  @Public()
  @Query(() => [ShowcaseNotebookModel], {
    name: 'getShowcaseNotebooks',
    description:
      'The official notebooks on the Showcase, newest first. Filter by category slug and by kind (category, case_study, working).',
  })
  getShowcaseNotebooks(
    @Args('category', { nullable: true }) category?: string,
    @Args('kind', { nullable: true }) kind?: string,
  ): Promise<ShowcaseNotebookModel[]> {
    return this.showcaseService.listNotebooks({
      category,
      kind: kind as ShowcaseKind | undefined,
    });
  }

  @Public()
  @Query(() => GraphQLJSON, {
    name: 'getShowcaseConfig',
    description:
      'What the Showcase is laid out from: its taxonomy (groups, categories, chain order), chain colors and template sections.',
  })
  getShowcaseConfig(): Promise<ShowcaseConfig> {
    return this.showcaseService.getConfig();
  }

  @Mutation(() => Boolean, {
    name: 'setDocumentShowcase',
    description:
      "Set a notebook's Showcase metadata, or pass null to take it off the Showcase.",
  })
  setDocumentShowcase(
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('showcase', { type: () => GraphQLJSON, nullable: true })
    showcase: unknown,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.showcaseService.setShowcase(
      documentId,
      workspaceId,
      userId,
      showcase,
    );
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'submitShowcaseLead',
    description:
      'Ask for a protocol to be covered, ask for a report, or claim the case study about your protocol. Saved for the sales team.',
  })
  submitShowcaseLead(
    @Args('input', { type: () => GraphQLJSON }) input: unknown,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.showcaseService.createLead(input, userId);
  }

  // ── The studio: the team's internal Showcase editor. Needs the studio password, or a staff account. ──

  @Public()
  @Query(() => GraphQLJSON, {
    name: 'getShowcaseAdmin',
    description:
      'For the studio: every notebook in the official workspaces with its Showcase metadata (drafts too), and the leads that came in. Needs the studio password, or a staff account.',
  })
  getShowcaseAdmin(
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ) {
    return this.adminService.getOverview({ userId, password });
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'saveShowcaseNotebook',
    description:
      "Set an official notebook's Showcase metadata, or pass null to take it off the Showcase. Needs the studio password, or a staff account.",
  })
  saveShowcaseNotebook(
    @Args('documentId') documentId: string,
    @Args('showcase', { type: () => GraphQLJSON, nullable: true })
    showcase: unknown,
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.adminService.saveNotebook(
      { userId, password },
      documentId,
      showcase ?? null,
    );
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'saveShowcaseCategory',
    description:
      'Create a Showcase category, or change the one with the same slug. Needs the studio password, or a staff account.',
  })
  saveShowcaseCategory(
    @Args('input', { type: () => GraphQLJSON }) input: unknown,
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.adminService.saveCategory({ userId, password }, input);
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'deleteShowcaseCategory',
    description:
      'Delete a Showcase category that has no notebooks filed under it. Needs the studio password, or a staff account.',
  })
  deleteShowcaseCategory(
    @Args('slug') slug: string,
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.adminService.deleteCategory({ userId, password }, slug);
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'saveShowcaseChain',
    description:
      "Set a chain's color and its place among the Showcase chain filters. Needs the studio password, or a staff account.",
  })
  saveShowcaseChain(
    @Args('input', { type: () => GraphQLJSON }) input: unknown,
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.adminService.saveChain({ userId, password }, input);
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'approveShowcaseClaim',
    description:
      "Approve a claim lead: marks the case study it names as claimed by the protocol's team. Needs the studio password, or a staff account.",
  })
  approveShowcaseClaim(
    @Args('leadId') leadId: string,
    @Args('password', { nullable: true }) password?: string,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.adminService.approveClaim({ userId, password }, leadId);
  }
}
