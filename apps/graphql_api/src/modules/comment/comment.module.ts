import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
// import { CommentGateway } from './comment.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, UserEntity]),
    AuthModule,
  ],
  providers: [CommentResolver, CommentService],
  exports: [CommentService],
})
export class CommentModule {}