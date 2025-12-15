"use client";

import { redirect } from "next/navigation";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";

export default function SettingsPage() {
  const workspaceId = useStringQuery("workspace");

  redirect(`/workspace/${workspaceId}/settings/profile`);
}
