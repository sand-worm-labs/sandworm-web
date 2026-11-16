import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import {
  TerminalClientDetail,
  TerminalSession,
  TerminalSetup,
  TerminalSourceRun,
  TerminalTeamClient,
  TerminalTeamClientDraft,
} from './terminal.model';
import { TerminalService } from './terminal.service';
import { TerminalTeamService } from './terminal-team.service';

@Resolver(() => TerminalSetup)
export class TerminalResolver {
  constructor(
    private readonly terminalService: TerminalService,
    private readonly teamService: TerminalTeamService,
  ) {}

  @Query(() => TerminalSetup, {
    name: 'terminalSetup',
    nullable: true,
    description:
      "The current user's terminal setup, or null before they first save it.",
  })
  terminalSetup(@CurrentUser('id') userId: string) {
    return this.terminalService.getSetup(userId);
  }

  @Query(() => TerminalSession, {
    name: 'terminalSession',
    description:
      'The signed-in user and the terminal client they belong to (null before their first setup save).',
  })
  terminalSession(@CurrentUser('id') userId: string) {
    return this.terminalService.getSession(userId);
  }

  @Mutation(() => TerminalSetup, {
    name: 'saveTerminalSetup',
    description:
      "Save the current user's terminal setup, as far as they have filled it in.",
  })
  saveTerminalSetup(
    @CurrentUser('id') userId: string,
    @Args('input', { type: () => TerminalSetup }) input: TerminalSetup,
  ) {
    return this.terminalService.saveSetup(userId, input);
  }

  @Mutation(() => Boolean, {
    name: 'markTerminalWelcomed',
    description:
      'The current member has seen the welcome; it is not shown again.',
  })
  markTerminalWelcomed(@CurrentUser('id') userId: string) {
    return this.terminalService.markWelcomed(userId);
  }

  // ── The Sandworm team's side. Staff only. ──

  @Query(() => Boolean, {
    name: 'terminalIsStaff',
    description:
      'Whether the current user is on the Sandworm team, for showing the terminal team tools.',
  })
  terminalIsStaff(@CurrentUser('id') userId: string) {
    return this.teamService.isStaff(userId);
  }

  @Query(() => [TerminalTeamClient], {
    name: 'terminalClients',
    description: 'Every terminal client, newest first. Staff only.',
  })
  terminalClients(@CurrentUser('id') userId: string) {
    return this.teamService.listClients(userId);
  }

  @Query(() => TerminalClientDetail, {
    name: 'terminalClient',
    description:
      "One client with who reads it, what is open and the notebooks its terminal is built from. Staff only.",
  })
  terminalClient(
    @CurrentUser('id') userId: string,
    @Args('clientId') clientId: string,
  ) {
    return this.teamService.getClient(userId, clientId);
  }

  @Mutation(() => TerminalSourceRun, {
    name: 'runTerminalSource',
    description:
      "Run one of a client's notebooks on their behalf, as the staff member (who needs edit access to it). Staff only.",
  })
  runTerminalSource(
    @CurrentUser('id') userId: string,
    @Args('clientId') clientId: string,
    @Args('documentId') documentId: string,
  ) {
    return this.teamService.runSource(userId, clientId, documentId);
  }

  @Mutation(() => TerminalTeamClient, {
    name: 'createTerminalClient',
    description:
      'Set a client up: its details, plan, what to track and an invite for its admin. Staff only.',
  })
  createTerminalClient(
    @CurrentUser('id') userId: string,
    @Args('input', { type: () => TerminalTeamClientDraft })
    input: TerminalTeamClientDraft,
  ) {
    return this.teamService.createClient(userId, input);
  }

  @Mutation(() => TerminalTeamClient, {
    name: 'sendTerminalInvite',
    description:
      "Mark a client's admin invite as sent (the admin joins by signing in with the invited email). Staff only.",
  })
  sendTerminalInvite(
    @CurrentUser('id') userId: string,
    @Args('clientId') clientId: string,
  ) {
    return this.teamService.sendInvite(userId, clientId);
  }
}
