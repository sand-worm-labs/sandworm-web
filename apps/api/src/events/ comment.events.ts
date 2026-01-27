import { Comment } from "@/features/collaboration/comment/model/comment.model";

export class CommentDeletedEvent {
    commentId: string;
    documentId: string;
    workspaceId: string;
}


export class CommentCreatedEvent {
    documentId: string;
    comment: Comment;
};

export const EventNames = {
    DOCUMENT_COMMENTS: 'document-comments',
    COMMENT_CREATED: 'document-comment',
    COMMENT_DELETED: 'document-comment-deleted',
} as const;
