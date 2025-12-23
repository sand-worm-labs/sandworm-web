import { Socket as BaseSocket, Server as BaseServer } from 'socket.io'
import {
  DocumentEntity,
  ReusableComponentEntity,
  EnvironmentStatus,
} from '@sandworm/postgresql-typeorm'
// import { Comment, TutorialState } from '@sandworm/types'
// import { Session } from '../types'

export interface EmitEvents {
  'environment-status-update': (msg: {
    workspaceId: string
    status: EnvironmentStatus
    startedAt: string | null
  }) => void
  'environment-status-error': (msg: {
    workspaceId: string
    error: string
  }) => void

  'workspace-error': (msg: { workspaceId: string; error: string }) => void
  'workspace-documents': (msg: {
    workspaceId: string
    documents: DocumentEntity[]
  }) => void
  'workspace-document-update': (msg: {
    workspaceId: string
    document: DocumentEntity
  }) => void

  'workspace-components': (msg: {
    workspaceId: string
    components: ReusableComponentEntity[]
  }) => void
  'workspace-component-update': (msg: {
    workspaceId: string
    component: ReusableComponentEntity
  }) => void
  'workspace-component-removed': (msg: {
    workspaceId: string
    componentId: string
  }) => void

  // 'document-comments': (msg: {
  //   documentId: string
  //   comments: Comment[]
  // }) => void
  'document-comment': (msg: { documentId: string; comment: Comment }) => void
  'document-comment-deleted': (msg: {
    documentId: string
    commentId: string
  }) => void
  'workspace-tutorial-update': (msg: {
    workspaceId: string
    tutorialType: 'onboarding'
    // tutorialState: TutorialState
  }) => void
}

// export interface TypedSocket extends BaseSocket<any, EmitEvents> {
//   session?: Session
// }

// export type TypedServer = BaseServer<any, EmitEvents>

// export interface TypedSocket extends BaseSocket<any, EmitEvents> {
//   session?: Session
// }
