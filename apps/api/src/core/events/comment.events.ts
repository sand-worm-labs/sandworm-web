import { Comment } from "@/features/collaboration/comment/model/comment.model";

export class CommentDeletedEvent {
    commentId: string;
    documentId: string;
    workspaceId: string;

    constructor(commentId: string, documentId: string, workspaceId: string) {
        this.commentId = commentId;
        this.documentId = documentId;
        this.workspaceId = workspaceId;
    }
}


export class CommentCreatedEvent {
    documentId: string;
    comment: Comment;
    constructor(documentId: string, comment: Comment) {
        this.documentId = documentId;
        this.comment = comment;
    }
};

export const CommentEventNames = {
    DOCUMENT_COMMENTS: 'document-comments',
    COMMENT_CREATED: 'document-comment',
    COMMENT_DELETED: 'document-comment-deleted',
} as const;
