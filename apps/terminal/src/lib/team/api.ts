// What the team's list shows for each client.
export const TEAM_CLIENT_FIELDS = `id name type plan status adminEmail createdAt`;

// What the team's client page shows for one client.
export const TEAM_CLIENT_DETAIL_FIELDS = `
  ${TEAM_CLIENT_FIELDS}
  website description members lastReadAt openRequests newSignals researchAllowance
  sources {
    documentId title path cells items lastRanAt
    schedule { isActive nextRunAt lastRunAt }
  }
`;

// A key number as the team edits it
export const TEAM_KPI_FIELDS = `
  id subjectId key label description position isVisible
  format direction comparison source lastReadingAt
  display { id label value delta { text tone } comparison }
`;
