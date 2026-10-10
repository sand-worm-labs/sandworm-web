// Where a person's profile lives. Inside a workspace it opens in the app; for a
// visitor who is not in one, it is the public page.
export const profileHref = (workspaceId: string | undefined, userId: string) =>
  workspaceId
    ? `/workspace/${workspaceId}/profile/${userId}`
    : `/profile/${userId}`;
