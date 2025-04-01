"use client";

import { useEffect } from "react";

import EmptyState from "@/components/EmptyState";

interface UnauthorizeStateProps {
  error: Error;
}

const UnauthorizeState: React.FC<UnauthorizeStateProps> = ({ error }) => {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      title="Uh No"
      subtitle="You don't have permission for this resource"
      showReset
      label="Go back home"
    />
  );
};

export default UnauthorizeState;
