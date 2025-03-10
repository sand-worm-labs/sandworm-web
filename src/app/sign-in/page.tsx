import React from "react";
import { redirect } from "next/navigation";

import SignIn from "@/components/AuthUI/SignIn";
import { isUserAuthenticated } from "@/services/firebase/admin";

export default async function SignInPage() {
  if (await isUserAuthenticated()) redirect("/workspace");

  return <SignIn />;
}
