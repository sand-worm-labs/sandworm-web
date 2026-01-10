import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { AuthGraphqlModule } from '@/features/auth/graphql/auth-graphql.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, UserEntity]),
    AuthGraphqlModule,
  ],
  providers: [CommentResolver, CommentService],
  exports: [CommentService],
})
export class CommentModule { }