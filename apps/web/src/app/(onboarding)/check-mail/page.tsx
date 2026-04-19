import { CheckMail } from "@/components/AuthUI/CheckMail";
import { Stepper } from "@/components/AuthUI/Stepper";

export default function CheckMailPage() {
  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden">
      <Stepper
        currentStep={1}
        steps={[
          { name: "Personal Info", href: "/signup?step=1" },
          { name: "Credentials", href: "/signup?step=2" },
          { name: "Claim Handle", href: "/signup?step=3" },
        ]}
      />
      <div className="flex-1 min-h-0 flex items-center">
        <CheckMail />
      </div>
    </div>
  );
}
