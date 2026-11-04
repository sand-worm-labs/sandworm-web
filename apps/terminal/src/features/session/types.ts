export type Analyst = {
  name: string;
  fullName: string;
  initials: string;
  role: string;
};

export type Session = {
  user: { name: string };
  client: {
    name: string;
    analyst: Analyst;
    kickoffCall: { when: string; minutes: number };
    firstBriefingDays: number;
  };
};
