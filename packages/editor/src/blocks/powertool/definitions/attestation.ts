import type { ToolDefinition } from "../types.js";
import { CHAIN_OPTIONS, TIME_RANGE_OPTIONS } from "../constants.js";

export const ATTESTATION_DEFINITIONS: ToolDefinition[] = [
  {
    id: "attestations.volume",
    templateId: "attestations.volume",
    categoryId: "attestations",
    name: "Attestation volume",
    description: "Daily attestation counts on EAS — total volume and per-schema breakdown.",
    tags: ["eas", "attestation", "identity", "volume", "schema", "onchain"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "attestations.by_schema",
    templateId: "attestations.by_schema",
    categoryId: "attestations",
    name: "Attestation analytics by schema",
    description: "Deep metrics for a specific EAS schema — daily check-ins, quest completions, any custom schema.",
    tags: ["eas", "attestation", "schema", "quest", "checkin", "gaming", "identity"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      { key: "schema_uid", label: "Schema UID", type: "schema_uid", required: true, placeholder: "0x57fe1f84..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "attestations.multi_schema",
    templateId: "attestations.multi_schema",
    categoryId: "attestations",
    name: "Multi-schema attestation dashboard",
    description: "Compare metrics across multiple EAS schemas simultaneously.",
    tags: ["eas", "attestation", "multi-schema", "dashboard", "compare", "gaming"],
    uiHint: "list-builder",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      // address[] is reused here — schema UIDs are hex strings of the same length
      { key: "schema_uids", label: "Schema UIDs", type: "address[]", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "attestations.attestor_analytics",
    templateId: "attestations.attestor_analytics",
    categoryId: "attestations",
    name: "Attestor analytics",
    description: "Volume, recipients, and schema breakdown for a specific attesting address.",
    tags: ["eas", "attestation", "attester", "issuer", "identity", "reputation"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      { key: "attestor_address", label: "Attestor address", type: "address", required: true, placeholder: "0x..." },
      { key: "days", label: "Time range", type: "select", required: true, options: TIME_RANGE_OPTIONS, default: "30" },
    ],
  },

  {
    id: "attestations.recipient_analytics",
    templateId: "attestations.recipient_analytics",
    categoryId: "attestations",
    name: "Recipient analytics",
    description: "All attestations received by a wallet — schema breakdown and full timeline.",
    tags: ["eas", "attestation", "recipient", "identity", "reputation", "credentials"],
    uiHint: "form",
    params: [
      { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      { key: "recipient_address", label: "Recipient address", type: "address", required: true, placeholder: "0x..." },
    ],
  },

  {
    id: "attestations.gitcoin_passport",
    templateId: "attestations.gitcoin_passport",
    categoryId: "attestations",
    name: "Gitcoin Passport score distribution",
    description: "Score distribution and stamp breakdown for Gitcoin Passport holders.",
    tags: ["gitcoin", "passport", "score", "sybil", "identity", "stamps"],
    uiHint: "form",
    params: [
   { key: "chain", label: "Chain", type: "chain", required: true, options: CHAIN_OPTIONS, default: "optimism" },
      { key: "wallet", label: "Wallet address (optional — leave empty for aggregate view)", type: "address", required: false, placeholder: "0x..." },
    ],
  },
];