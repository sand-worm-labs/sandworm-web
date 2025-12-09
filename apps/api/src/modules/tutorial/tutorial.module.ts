import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGraphqlModule } from '../auth-graphql/auth-graphql.module';
import { TutorialService } from './tutorial.service';
import { TutorialResolver } from './tutorial.resolver'
import { TutorialEntity } from '@sandworm/postgresql-typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TutorialEntity]), AuthGraphqlModule],
  providers: [TutorialResolver, TutorialService],
  exports: [TutorialService],
})
export class TutorialModule {}