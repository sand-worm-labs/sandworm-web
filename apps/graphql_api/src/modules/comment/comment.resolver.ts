import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@sandworm/graphql';
import { CommentService } from './comment.service';
import { Comment } from './model/comment.model';
import { CreateCommentInput, DeleteCommentInput } from './dto/comment.dto';


@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Query(() => [Comment], {
    name: 'comments',
    description: 'Get all comments for a document',
  })
  async getComments(
    @Args('documentId') documentId: string,
  ): Promise<Comment[]> {
    return this.commentService.getCommentsByDocument(documentId);
  }


  @Query(() => Comment, {
    name: 'comment',
    description: 'Get a single comment by ID',
  })
  async getComment(
    @Args('commentId') commentId: string,
  ): Promise<Comment> {
    return this.commentService.getComment(commentId);
  }

  @Mutation(() => Comment, {
    name: 'createComment',
    description: 'Create a new comment on a document',
  })
  async createComment(
    @Args('documentId') documentId: string,
    @Args('input') input: CreateCommentInput,
    @CurrentUser('id') authorId: string,
  ): Promise<Comment> {
    const comment = await this.commentService.createComment(
      documentId,
      authorId,
      input,
    );

    return comment;
  }

  @Mutation(() => Boolean, {
    name: 'deleteComment',
    description: 'Delete a comment (only by comment author)',
  })
  async deleteComment(
    @Args('input') input: DeleteCommentInput,
    @CurrentUser('id') authorId: string,
  ): Promise<boolean> {
    const result = await this.commentService.deleteComment(input, authorId);
    return result;
  }
}