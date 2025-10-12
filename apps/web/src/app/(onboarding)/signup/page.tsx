import { SignUp } from "@/components/AuthUI/SignUp";
import { Stepper } from "@/components/AuthUI/Stepper";

export default function SignUpPage() {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <Stepper
        currentStep={0}
        steps={[
          { name: "Sign Up", href: "/signup" },
          { name: "Setup Sundomain", href: "/claim" },
        ]}
      />

      <div className="flex-1 min-h-0 flex items-center">
        <SignUp />
      </div>
    </div>
  );
}
