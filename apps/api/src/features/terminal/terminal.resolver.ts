import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { TerminalSession, TerminalSetup } from './terminal.model';
import { TerminalService } from './terminal.service';

@Resolver(() => TerminalSetup)
export class TerminalResolver {
  constructor(private readonly terminalService: TerminalService) {}

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
}
