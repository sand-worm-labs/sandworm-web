// What to tell someone when a notebook cannot be verified: the reason the server gave, put
// plainly, and what to do about it. The server's wording is for the logs; this is for the person.

export interface TrustFailure {
  message: string;
  steps: string[];
}

const RULES: { match: RegExp; steps: string[] }[] = [
  {
    match: /run the notebook first|has run yet|has a result yet/i,
    steps: [
      "Open the notebook and run every cell.",
      "Wait for them all to finish without errors.",
      "Come back and verify it.",
    ],
  },
  {
    match: /live notebook|runs in the browser|cloud notebook/i,
    steps: [
      "Only Cloud notebooks can be verified, because the check re-runs them on the server.",
      "Change the notebook's type to Cloud, or move the work into a Cloud notebook.",
    ],
  },
  {
    match: /not set up|must be different wallets/i,
    steps: [
      "Verification is not turned on for this server yet.",
      "Ask whoever runs this Sandworm to set it up, then try again.",
    ],
  },
  {
    match: /cell failed|failed when/i,
    steps: [
      "Open the notebook and find the cell that shows an error.",
      "Fix it, run the notebook again, then verify it.",
    ],
  },
  {
    match: /changed while|changed after/i,
    steps: [
      "Do not edit the notebook while it is being checked.",
      "Verify it again once you have finished editing.",
    ],
  },
  {
    match: /no code or parameters/i,
    steps: [
      "Add a SQL or Python cell to the notebook, run it, then verify it.",
    ],
  },
  {
    match: /could not be read back|still running/i,
    steps: ["This is usually temporary. Wait a minute and try again."],
  },
];

const DEFAULT_STEPS = [
  "Run the notebook and check that every cell works.",
  "Try verifying it again. If it keeps failing, tell us what the message above says.",
];

// A sentence: starts with a capital and ends with a full stop.
const sentence = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return "The notebook could not be verified.";
  const capital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capital) ? capital : `${capital}.`;
};

export function explainTrustFailure(reason?: string | null): TrustFailure {
  const message = sentence(reason ?? "");
  const rule = RULES.find(({ match }) => match.test(message));
  return { message, steps: rule?.steps ?? DEFAULT_STEPS };
}
