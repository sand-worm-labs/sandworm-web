import React from "react";

import { ClaimUsername } from "@/components/AuthUI/ClaimUsername";
import { Stepper } from "@/components/AuthUI/Stepper";

export default function ClaimPage() {
  return (
    <div>
      {/* stepper is manual for now not dynamic till we handle auth logic */}
      <Stepper
        currentStep={1}
        steps={[
          { name: "Sign Up", href: "/signup" },
          { name: "Setup Subdomain", href: "/claim" },
        ]}
      />
      <ClaimUsername />
    </div>
  );
}
