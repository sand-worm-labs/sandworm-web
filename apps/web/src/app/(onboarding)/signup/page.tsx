import { SignUp } from "@/components/AuthUI/SignUp";
import { Stepper } from "@/components/AuthUI/Stepper";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { step?: string };
}) {
  const step = Number(searchParams.step ?? "1");
  const currentStep = Math.min(Math.max(step - 1, 0), 2); // 0-indexed

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <Stepper
        currentStep={currentStep}
        steps={[
          { name: "Personal Info", href: "/signup?step=1" },
          { name: "Credentials", href: "/signup?step=2" },
          { name: "Claim Handle", href: "/signup?step=3" },
        ]}
      />

      <div className="flex-1 min-h-0 flex items-center">
        <SignUp />
      </div>
    </div>
  );
}