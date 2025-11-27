import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TutorialService } from './tutorial.service';
import { TutorialResolver } from './tutorial.resolver'
import { TutorialEntity } from '@sandworm/postgresql-typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TutorialEntity]), AuthModule],
  providers: [TutorialResolver, TutorialService],
  exports: [TutorialService],
})
export class TutorialModule {}