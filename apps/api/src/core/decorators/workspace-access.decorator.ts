import { SetMetadata } from '@nestjs/common';

export const SKIP_WORKSPACE_CHECK = 'skipWorkspaceCheck';
export const ALLOW_SHARED_DOCUMENT = 'allowSharedDocument';

// The handler checks access itself (e.g. accepting an invitation, where the
// caller is not a member yet). Use sparingly.
export const SkipWorkspaceCheck = () => SetMetadata(SKIP_WORKSPACE_CHECK, true);

// Non-members may call this when the `documentId` it names is shared by link
// or published. Members always may.
export const AllowSharedDocument = () => SetMetadata(ALLOW_SHARED_DOCUMENT, true);
