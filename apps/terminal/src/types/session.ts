import type { SubjectIcon } from "@sandworm/types/terminal";

export type Session = {
  user: { name: string };
  client: {
    name: string;
    icon: SubjectIcon | null;
    firstBriefingDays: number;
  };
};
