import { ClaimUsername } from "@/components/AuthUI/ClaimUsername";
import { SignUp } from "@/components/AuthUI/SignUp";

export default function SignUpPage() {
  return (
    <div>
      {/*       <SignUp />
       */}{" "}
      <SignUp />
      <ClaimUsername />
    </div>
  );
}
