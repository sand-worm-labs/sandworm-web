import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { TutorialService } from './tutorial.service';
import {
  GetTutorialStateInput,
  AdvanceTutorialInput,
  DismissTutorialInput,
} from './dto/tutorial.dto';
import { TutorialState } from './model/tutorial.model';
import { CurrentUser } from '@sandworm/graphql';

@Resolver()
export class TutorialResolver {
  constructor(private readonly tutorialService: TutorialService) {}

  @Query(() => TutorialState, {
    name: 'getTutorialState',
    description: 'Get the current state of a tutorial',
  })
  async getTutorialState(
    @Args('input') input: GetTutorialStateInput,
    @CurrentUser("id") userId 
  ): Promise<TutorialState> {
    return this.tutorialService.getTutorialState(userId,input);
  }

  @Mutation(() => TutorialState, {
    name: 'advanceTutorial',
    description: 'Advance to the next step in the tutorial',
  })
  async advanceTutorial(
    @Args('input') input: AdvanceTutorialInput,
    @CurrentUser('id') userId: string,
  ): Promise<TutorialState> {
    return this.tutorialService.advanceTutorial(userId, input);
  }

  @Mutation(() => TutorialState, {
    name: 'dismissTutorial',
    description: 'Dismiss a completed tutorial',
  })
  async dismissTutorial(
    @Args('input') input: DismissTutorialInput,
    @CurrentUser("id") userId 
  ): Promise<TutorialState> {
    return this.tutorialService.dismissTutorial(userId, input);
  }
}