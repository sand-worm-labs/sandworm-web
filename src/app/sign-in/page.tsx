import React from "react";
import { isUserAuthenticated } from "@/services/firebase/admin";
import { signInWithGoogle } from "@/services/firebase/auth";
import SignIn from "@/components/SignIn";

export default async function SignInPage() {
  return (
    <div>
      <SignIn />
    </div>
  );
}
