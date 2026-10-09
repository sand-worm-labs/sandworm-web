import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { Public } from '@sandworm/nest-common';
import type { ShowcaseKind } from '@sandworm/types';
import { GraphQLJSON } from 'graphql-type-json';
import { ShowcaseNotebookModel } from './showcase.model';
import { ShowcaseService, type ShowcaseConfig } from './showcase.service';

@Resolver()
export class ShowcaseResolver {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @Public()
  @Query(() => [ShowcaseNotebookModel], {
    name: 'getShowcaseNotebooks',
    description: 'The official notebooks on the Showcase, newest first. Filter by category slug and by kind (category, case_study, working).',
  })
  getShowcaseNotebooks(
    @Args('category', { nullable: true }) category?: string,
    @Args('kind', { nullable: true }) kind?: string,
  ): Promise<ShowcaseNotebookModel[]> {
    return this.showcaseService.listNotebooks({ category, kind: kind as ShowcaseKind | undefined });
  }

  @Public()
  @Query(() => GraphQLJSON, {
    name: 'getShowcaseConfig',
    description: 'What the Showcase is laid out from: its taxonomy (groups, categories, chain order), chain colors and template sections.',
  })
  getShowcaseConfig(): Promise<ShowcaseConfig> {
    return this.showcaseService.getConfig();
  }

  @Mutation(() => Boolean, {
    name: 'setDocumentShowcase',
    description: 'Set a notebook\'s Showcase metadata, or pass null to take it off the Showcase.',
  })
  setDocumentShowcase(
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('showcase', { type: () => GraphQLJSON, nullable: true }) showcase: unknown,
    @CurrentUser('id') userId: string,
  ): Promise<boolean> {
    return this.showcaseService.setShowcase(documentId, workspaceId, userId, showcase);
  }

  @Public()
  @Mutation(() => Boolean, {
    name: 'submitShowcaseLead',
    description: 'Ask for a protocol to be covered, ask for a report, or claim the case study about your protocol. Saved for the sales team.',
  })
  submitShowcaseLead(
    @Args('input', { type: () => GraphQLJSON }) input: unknown,
    @CurrentUser('id') userId?: string,
  ): Promise<boolean> {
    return this.showcaseService.createLead(input, userId);
  }
}
