import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingTutorialEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth/auth.module';
import { TutorialResolver } from './tutorial.resolver';
import { TutorialService } from './tutorial.service';
import { TutorialGateway } from './tutorial.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingTutorialEntity]), AuthModule],
  providers: [TutorialResolver, TutorialService, TutorialGateway],
  exports: [TutorialService, TutorialGateway],
})
export class TutorialModule {}