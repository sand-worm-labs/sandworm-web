import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingTutorialStep, TutorialType, TutorialEntity } from '@sandworm/postgresql-typeorm';
import { ValidationException, } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import {
  GetTutorialStateInput,
  AdvanceTutorialInput,
  DismissTutorialInput,
} from './dto/tutorial.dto';
import { TutorialState } from './model/tutorial.model';

@Injectable()
export class TutorialService {
  private readonly logger = new Logger(TutorialService.name);

  constructor(
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepository: Repository<TutorialEntity>,
  ) {}

  private toGraphQLTutorialState(state: TutorialEntity): TutorialState {
    return {
    currentStep: state.currentStep,
    isComplete: state.isComplete,
    isDismissed: state.isDismissed,
    stepStates: null
}
  }

  private validateTutorialType(tutorialType: string): void {
    if (tutorialType !== TutorialType.ONBOARDING) {
      throw new ValidationException(
        ErrorCode.E502,
        `Invalid tutorial type. Only '${TutorialType.ONBOARDING}' is supported`,
      );
    }
  }

  async getTutorialState( userId: string ,input: GetTutorialStateInput): Promise<TutorialState> {
    const { workspaceId, tutorialType } = input;
    this.validateTutorialType(tutorialType);

    const tutorials = await  this.tutorialRepository.findOne({
        where: { workspaceId, userId },
    })

    tutorials[0].currentStep

    if (!tutorialState) {
        throw new ValidationException(ErrorCode.E404, 'Tutorial state not found',);
    }

    return this.toGraphQLTutorialState(tutorialState);
  }

  async advanceTutorial(
    userId: string,
    input: AdvanceTutorialInput
  ): Promise<TutorialState> {
    const { workspaceId, tutorialType } = input;

    this.validateTutorialType(tutorialType);

    this.logger.log(
      `Advancing tutorial for workspace ${workspaceId}, type: ${tutorialType}`,
    );

    
    const tutorialState = await advanceTutorialFn(
        workspaceId,
        tutorialType,
        null,
    );

    if (!tutorialState.prevStep || !tutorialState.currentState) {
        throw new ValidationException(
          ErrorCode.E404,
          'Tutorial not found or cannot be advanced',
        );
    }

    return this.toGraphQLTutorialState(tutorialState.currentState);

  }

  async dismissTutorial(
    userId: string,
    input: DismissTutorialInput,
  ): Promise<TutorialState> {
    const { workspaceId, tutorialType } = input;

    this.validateTutorialType(tutorialType);

    this.logger.log(
      `Dismissing tutorial for workspace ${workspaceId}, type: ${tutorialType}`,
    );


    const tutorial = await this.tutorialRepository.findOne({
        where: { workspaceId },
      });

      if (!tutorial) {
        throw new ValidationException(ErrorCode.E404, 'Tutorial not found');
      }

      if (!tutorial.isComplete) {
        throw new ValidationException(
          ErrorCode.E406,
          'Cannot dismiss tutorial that is not complete',
        );
      }

      // Dismiss the tutorial
      const tutorialState = await dismissTutorialFn(workspaceId, tutorialType);

      if (!tutorialState) {
        throw new ValidationException(
          ErrorCode.E404,
          'Tutorial state not found',
        );
      }

    return this.toGraphQLTutorialState(tutorialState);
  }


}