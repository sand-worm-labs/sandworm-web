"use client";

import { gql, useMutation } from "@apollo/client";
import { useCallback, useState } from "react";

import type {
  ShowcaseEventName,
  ShowcaseLeadInput,
  ShowcaseLeadKind,
} from "@/types";

import { useShowcaseTrack } from "./useShowcaseTrack";

// =====================================
// ⬢  Constants
// =====================================
const SUBMIT_LEAD = gql`
  mutation SubmitShowcaseLead($input: JSON!) {
    submitShowcaseLead(input: $input)
  }
`;

const LEAD_EVENT: Record<ShowcaseLeadKind, ShowcaseEventName> = {
  coverage: "coverage_requested",
  report: "report_requested",
  claim: "claim_requested",
};

// =====================================
// ⬢  useShowcaseLead
// =====================================
// Sends a coverage request, a report request or a claim to the sales inbox,
// with where the visitor came from, and fires the matching funnel event.
export function useShowcaseLead() {
  // State
  const [submitLead, { loading }] = useMutation(SUBMIT_LEAD);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { track, utm } = useShowcaseTrack();

  // Handlers
  const submit = useCallback(
    async (lead: Omit<ShowcaseLeadInput, "source">) => {
      setError(null);
      try {
        const source = Object.keys(utm).length > 0 ? utm : undefined;
        await submitLead({ variables: { input: { ...lead, source } } });
        track(LEAD_EVENT[lead.kind], {
          category: lead.category,
          protocol: lead.protocol,
        });
        setSent(true);
      } catch (err) {
        setError((err as Error).message || "Could not send. Try again.");
      }
    },
    [submitLead, track, utm]
  );

  const reset = useCallback(() => {
    setSent(false);
    setError(null);
  }, []);

  return { submit, reset, loading, sent, error };
}
