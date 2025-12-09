import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  OnboardingTutorialStep,
  TutorialType,
  TutorialEntity,
} from '@sandworm/postgresql-typeorm';
import { ValidationException } from '@sandworm/graphql';
import { ErrorCode } from '@/constants/error-code.constant';
import {
  GetTutorialStateInput,
  AdvanceTutorialInput,
  DismissTutorialInput,
} from './dto/tutorial.dto';
import {
  TutorialState,
  AdvanceTutorialResult,
  StepStates,
  StepState,
} from './model/tutorial.model';
import { ONBOARDING_STEP_ORDER } from './tutorial.constant';

@Injectable()
export class TutorialService {
  private readonly logger = new Logger(TutorialService.name);

  constructor(
    @InjectRepository(TutorialEntity)
    private readonly tutorialRepository: Repository<TutorialEntity>,
  ) {}

 
  private stepStatesFromStep(
    stepIds: OnboardingTutorialStep[],
    currentStep: OnboardingTutorialStep,
    isComplete: boolean,
  ): StepStates {
    const currentStepIndex = stepIds.indexOf(currentStep);

    return stepIds.reduce<StepStates>((acc, stepId, index) => {
      if (isComplete) {
        return { ...acc, [stepId]: StepState.COMPLETED };
      }

      if (index < currentStepIndex) {
        return { ...acc, [stepId]: StepState.COMPLETED };
      } else if (index === currentStepIndex) {
        return { ...acc, [stepId]: StepState.CURRENT };
      } else {
        return { ...acc, [stepId]: StepState.UPCOMING };
      }
    }, {} as StepStates);
  }


  private toGraphQLTutorialState(tutorial: TutorialEntity): TutorialState {
    const stepStates = this.stepStatesFromStep(
      ONBOARDING_STEP_ORDER,
      tutorial.currentStep,
      tutorial.isComplete,
    );

    return {
      id: tutorial.id,
      currentStep: tutorial.currentStep,
      isCompleted: tutorial.isComplete,
      isDismissed: tutorial.isDismissed,
      stepStates:null,
    };
  }

 
  private validateTutorialType(tutorialType: string): void {
    if (tutorialType !== TutorialType.ONBOARDING) {
      throw new ValidationException(
        ErrorCode.E502,
        `Invalid tutorial type. Only '${TutorialType.ONBOARDING}' is supported`,
      );
    }
  }

 
  async getTutorialState(
    userId: string,
    input: GetTutorialStateInput,
  ): Promise<TutorialState> {
    const { workspaceId, tutorialType } = input;
    this.validateTutorialType(tutorialType);

    const tutorial = await this.tutorialRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!tutorial) {
      throw new ValidationException(
        ErrorCode.E404,
        'Tutorial state not found',
      );
    }

    return this.toGraphQLTutorialState(tutorial);
  }


  async advanceTutorial(
    userId: string,
    input: AdvanceTutorialInput,
  ): Promise<AdvanceTutorialResult> {
    const { workspaceId, tutorialType, ifCurrentStep } = input;
    this.validateTutorialType(tutorialType);

    this.logger.log(
      `Advancing tutorial for workspace ${workspaceId}, type: ${tutorialType}`,
    );

    const tutorial = await this.tutorialRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!tutorial) {
      this.logger.error(
        { workspaceId, tutorialType },
        'Trying to advance tutorial that does not exist',
      );
      throw new ValidationException(
        ErrorCode.E404,
        'Tutorial not found',
      );
    }

    // Check if we should advance based on current step condition
    if (
      ifCurrentStep &&
      (tutorial.isComplete || tutorial.currentStep !== ifCurrentStep)
    ) {
      return {
        prevStep: tutorial.currentStep,
        currentState: this.toGraphQLTutorialState(tutorial),
        didAdvance: false,
      };
    }

    const currentIndex = ONBOARDING_STEP_ORDER.indexOf(tutorial.currentStep);
    const nextStepIndex = currentIndex + 1;

    
    if (nextStepIndex === ONBOARDING_STEP_ORDER.length) {
      const updatedTutorial = await this.tutorialRepository.save({
        ...tutorial,
        isComplete: true,
      });

      return {
        prevStep: tutorial.currentStep,
        currentState: this.toGraphQLTutorialState(updatedTutorial),
        didAdvance: true,
      };
    }

    const nextStep = ONBOARDING_STEP_ORDER[nextStepIndex];
    if (!nextStep) {
      this.logger.error(
        { workspaceId, tutorialType, nextStepIndex },
        'Trying to advance tutorial to a step that does not exist',
      );
      throw new ValidationException(
        ErrorCode.E500,
        'Cannot advance tutorial - next step not found',
      );
    }

  
    const updatedTutorial = await this.tutorialRepository.save({
      ...tutorial,
      currentStep: nextStep,
    });

    return {
      prevStep: tutorial.currentStep,
      currentState: this.toGraphQLTutorialState(updatedTutorial),
      didAdvance: true,
    };
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
      where: { workspaceId, userId },
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

    const updatedTutorial = await this.tutorialRepository.save({
      ...tutorial,
      isDismissed: true,
    });

    return this.toGraphQLTutorialState(updatedTutorial);
  }
}