import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity, UserEntity } from '@sandworm/postgresql-typeorm';
import { Comment } from './model/comment.model';
import { CreateCommentInput, DeleteCommentInput } from './dto/comment.dto';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private toGraphQLComment(entity: CommentEntity): Comment {
    return {
       ...entity,
    };
  }

  async getCommentsByDocument(documentId: string): Promise<Comment[]> {
    const entities = await this.commentRepository.find({
      where: { documentId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return entities.map(entity => this.toGraphQLComment(entity));
  }

  async getComment(commentId: string): Promise<Comment> {
    const entity = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!entity) {
      throw new NotFoundException(`Comment ${commentId} not found`);
    }

    return this.toGraphQLComment(entity);
  }

  async createComment(
    documentId: string,
    authorId: string,
    input: CreateCommentInput,
  ): Promise<Comment> {
    const user = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const entity = this.commentRepository.create({
        id: input.id,
        body: input.body,
        documentId,
        authorId,   
    })

    await this.commentRepository.save(entity);

    this.logger.log(`Comment created: ${entity.id} on document ${documentId}`);

    return this.toGraphQLComment(entity);
  }

  async deleteComment(
    input: DeleteCommentInput,
    currentUserId: string,
  ): Promise<boolean> {
    const entity = await this.commentRepository.findOne({
      where: { id: input.commentId },
    });

    if (!entity) {
      throw new NotFoundException('Comment not found');
    }

    // Only comment author can delete their own comments
    if (entity.authorId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.delete({ id: input.commentId });

    this.logger.log(`Comment deleted: ${input.commentId}`);

    return true;
  }

  async getCommentCount(documentId: string): Promise<number> {
    return this.commentRepository.count({
      where: { documentId },
    });
  }
}