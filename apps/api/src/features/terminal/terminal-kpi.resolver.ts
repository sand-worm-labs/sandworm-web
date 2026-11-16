import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import {
  TerminalKpiDefinition,
  TerminalKpiInput,
  TerminalKpiValueInput,
  TerminalOverviewKpis,
} from './terminal.model';
import { TerminalKpiService } from './terminal-kpi.service';

@Resolver()
export class TerminalKpiResolver {
  constructor(private readonly kpis: TerminalKpiService) {}

  @Query(() => TerminalOverviewKpis, {
    name: 'terminalOverviewKpis',
    nullable: true,
    description: "The key numbers on the Overview of the user's client, null before they belong to one.",
  })
  terminalOverviewKpis(@CurrentUser('id') userId: string) {
    return this.kpis.overview(userId);
  }

  // ── The Sandworm team's side. Staff only. ──

  @Query(() => [TerminalKpiDefinition], {
    name: 'terminalClientKpis',
    description: "Every key number of a client, hidden ones too, with how each reads now. Staff only.",
  })
  terminalClientKpis(@CurrentUser('id') userId: string, @Args('clientId') clientId: string) {
    return this.kpis.clientKpis(userId, clientId);
  }

  @Mutation(() => TerminalKpiDefinition, {
    name: 'saveTerminalKpi',
    description: 'Create a key number, or change the one with this key. What is not sent stays. Staff only.',
  })
  saveTerminalKpi(
    @CurrentUser('id') userId: string,
    @Args('clientId') clientId: string,
    @Args('input', { type: () => TerminalKpiInput }) input: TerminalKpiInput,
  ) {
    return this.kpis.saveKpi(userId, clientId, input);
  }

  @Mutation(() => Boolean, { name: 'deleteTerminalKpi', description: 'Remove a key number and its readings. Staff only.' })
  deleteTerminalKpi(@CurrentUser('id') userId: string, @Args('kpiId') kpiId: string) {
    return this.kpis.deleteKpi(userId, kpiId);
  }

  @Mutation(() => TerminalKpiDefinition, {
    name: 'recordTerminalKpiValue',
    description: 'Record a reading by hand; one for the same date is replaced. Staff only.',
  })
  recordTerminalKpiValue(
    @CurrentUser('id') userId: string,
    @Args('kpiId') kpiId: string,
    @Args('input', { type: () => TerminalKpiValueInput }) input: TerminalKpiValueInput,
  ) {
    return this.kpis.recordValue(userId, kpiId, input);
  }
}
