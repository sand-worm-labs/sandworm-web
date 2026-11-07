import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import type { SignalStatusId } from '@sandworm/types/terminal';
import {
  TerminalAnalysis,
  TerminalBriefing,
  TerminalCounts,
  TerminalRequest,
  TerminalRequestInput,
  TerminalRequests,
  TerminalSignal,
  TerminalSignals,
} from './terminal-content.model';
import { TerminalContentService } from './terminal-content.service';

// What a terminal client reads and does: Briefing, Analysis, Signals, Requests.
@Resolver()
export class TerminalContentResolver {
  constructor(private readonly content: TerminalContentService) {}

  @Query(() => TerminalCounts, {
    name: 'terminalCounts',
    description: 'The numbers on the terminal section tabs: unread briefing, reports, open signals and open requests.',
  })
  terminalCounts(@CurrentUser('id') userId: string) {
    return this.content.getCounts(userId);
  }

  @Query(() => TerminalAnalysis, {
    name: 'terminalAnalysis',
    description: "The Analysis catalog of the user's terminal client: projects, regions and sectors with their reports.",
  })
  terminalAnalysis(@CurrentUser('id') userId: string) {
    return this.content.getAnalysis(userId);
  }

  @Query(() => TerminalBriefing, {
    name: 'terminalBriefing',
    description: "The user's briefing: recent items for their client and for them, with what they have read.",
  })
  terminalBriefing(@CurrentUser('id') userId: string) {
    return this.content.getBriefing(userId);
  }

  @Mutation(() => Boolean, { name: 'markTerminalBriefingRead' })
  markTerminalBriefingRead(
    @CurrentUser('id') userId: string,
    @Args('itemIds', { type: () => [ID] }) itemIds: string[],
  ) {
    return this.content.markBriefingRead(userId, itemIds.slice(0, 200));
  }

  @Mutation(() => Boolean, {
    name: 'markTerminalBriefingSeen',
    description: 'Records that the user opened Briefing now: the start of their next "since your last visit".',
  })
  markTerminalBriefingSeen(@CurrentUser('id') userId: string) {
    return this.content.markBriefingSeen(userId);
  }

  @Query(() => TerminalSignals, {
    name: 'terminalSignals',
    description: 'Patterns Sandworm saw in the client data and what they could mean, with the client triage.',
  })
  terminalSignals(@CurrentUser('id') userId: string) {
    return this.content.getSignals(userId);
  }

  @Mutation(() => TerminalSignal, { name: 'setTerminalSignalStatus' })
  setTerminalSignalStatus(
    @CurrentUser('id') userId: string,
    @Args('signalId', { type: () => ID }) signalId: string,
    @Args('status') status: string,
  ) {
    return this.content.setSignalStatus(userId, signalId, status as SignalStatusId);
  }

  @Query(() => TerminalRequests, {
    name: 'terminalRequests',
    description: "The client's research requests and questions, with this year's research allowance.",
  })
  terminalRequests(@CurrentUser('id') userId: string) {
    return this.content.getRequests(userId);
  }

  @Mutation(() => TerminalRequest, { name: 'submitTerminalRequest' })
  submitTerminalRequest(
    @CurrentUser('id') userId: string,
    @Args('input', { type: () => TerminalRequestInput }) input: TerminalRequestInput,
  ) {
    return this.content.submitRequest(userId, input);
  }

  @Mutation(() => TerminalRequest, {
    name: 'approveTerminalRequestScope',
    description: 'Approves the scope of a research request: the work starts and it counts toward the allowance.',
  })
  approveTerminalRequestScope(
    @CurrentUser('id') userId: string,
    @Args('requestId', { type: () => ID }) requestId: string,
  ) {
    return this.content.approveRequestScope(userId, requestId);
  }
}
