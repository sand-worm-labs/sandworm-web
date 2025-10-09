import { SignUp } from "@/components/AuthUI/SignUp";
import { Stepper } from "@/components/AuthUI/Stepper";

export default function SignUpPage() {
  return (
    <div>
      <Stepper
        currentStep={0}
        steps={[
          { name: "Sign Up", href: "/signup" },
          { name: "Setup Subdomain", href: "/claim" },
        ]}
      />

      <SignUp />
    </div>
  );
}
