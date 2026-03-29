"use client";

import { redirect } from "next/navigation";

import { useSession } from "@/components/Visualization/hooks/useAuth";

export default async function RootPage() {
  const session = await useSession({ redirectToLogin: true });

  if (!session) {
    redirect("/signin");
  }

  redirect("/workspace");
}
