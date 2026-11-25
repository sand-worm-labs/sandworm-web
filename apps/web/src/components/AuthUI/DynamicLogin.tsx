"use client";

import {
  DynamicContextProvider,
  getAuthToken,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { FaWallet } from "react-icons/fa";

import { DYNAMIC_ENVIRONMENT_ID } from "@/utils/env";

type DynamicLoginProps = {
  label: string;
  className: string;
  disabled: boolean;
  onStart: () => void;
  onCancel: () => void;
  // Dynamic's JWT, for the api to turn into a Sandworm session
  onToken: (token: string) => void;
};

const OpenDynamic = ({
  label,
  className,
  disabled,
  onStart,
}: Pick<DynamicLoginProps, "label" | "className" | "disabled" | "onStart">) => {
  const { setShowAuthFlow } = useDynamicContext();
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={() => {
        onStart();
        setShowAuthFlow(true);
      }}
    >
      <FaWallet size={18} />
      <span>{label}</span>
    </button>
  );
};

// Sign-in with a wallet or an email, through Dynamic. Sandworm's own session is
// the one that counts: Dynamic's ends as soon as its token is handed over, so a
// Sandworm sign-out signs out everywhere. Hidden until the environment id is set.
export const DynamicLogin = (props: DynamicLoginProps) => {
  const environmentId = DYNAMIC_ENVIRONMENT_ID();
  if (!environmentId) return null;

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        events: {
          onAuthSuccess: async ({ handleLogOut }) => {
            const token = getAuthToken();
            await handleLogOut();
            if (token) props.onToken(token);
            else props.onCancel();
          },
          onAuthFlowClose: props.onCancel,
        },
      }}
    >
      <OpenDynamic {...props} />
    </DynamicContextProvider>
  );
};
