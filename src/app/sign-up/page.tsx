import React from "react";
import { redirect } from "next/navigation";

import SignUp from "@/components/AuthUI/SignUp";
import { isUserAuthenticated } from "@/services/firebase/admin";

export default async function SignUpPage() {
  if (await isUserAuthenticated()) redirect("/workspace");

  return <SignUp />;
}
