import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import { CommentEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { Repository } from 'typeorm';
import { CreateCommentInput, DeleteCommentInput } from './dto/comment.dto';
import { Comment } from './model/comment.model';
import { EventEmitter2, EventEmitterReadinessWatcher } from '@nestjs/event-emitter';
import { CommentCreatedEvent, CommentDeletedEvent, CommentEventNames } from '@/core/events/comment.events';
import { User } from '@/features/user/model/graphql/user.model';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
  ) { }

  async getCommentsByDocument(documentId: string): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { documentId },
      order: { createdAt: 'ASC' },
    });
    return comments.map((c) => Comment.fromEntity(c));
  }

  async getComment(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new ValidationException(ErrorCode.E301); // comment not found
    }
    return Comment.fromEntity(comment);
  }

  async createComment(
    documentId: string,
    authorId: string,
    input: CreateCommentInput,
  ): Promise<Comment> {
    const userEntity = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!userEntity) {
      throw new ValidationException(ErrorCode.E305);
    }

    const commentEntity = this.commentRepository.create({
      id: input.id,
      body: input.body,
      documentId,
      authorId,
    });

    await this.commentRepository.save(commentEntity);

    const comment = Comment.fromEntity(commentEntity);
    let userFound = await this.userRepository.findOne({ where: { id: authorId } });
    let user = User.fromEntity(userFound);
    await this.eventEmitterReadinessWatcher.waitUntilReady();

    this.eventEmitter.emit(
      CommentEventNames.COMMENT_CREATED,
      new CommentCreatedEvent(documentId, comment, user),
    );

    return comment;
  }

  async deleteComment(
    input: DeleteCommentInput,
    currentUserId: string,
  ): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id: input.commentId },
    });

    if (!comment) {
      throw new ValidationException(ErrorCode.E301);
    }

    if (comment.authorId !== currentUserId) {
      throw new ValidationException(ErrorCode.E302);
    }

    await this.commentRepository.delete({ id: input.commentId });

    await this.eventEmitterReadinessWatcher.waitUntilReady();

    this.eventEmitter.emit(
      CommentEventNames.COMMENT_DELETED,
      new CommentDeletedEvent(input.commentId, comment.documentId, input.workspaceId),
    );

    return true;
  }

  async getCommentCount(documentId: string): Promise<number> {
    return this.commentRepository.count({ where: { documentId } });
  }
}