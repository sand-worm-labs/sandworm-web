export type Session = {
  user: { name: string };
  client: {
    name: string;
    firstBriefingDays: number;
  };
};
