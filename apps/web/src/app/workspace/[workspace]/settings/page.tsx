"use client";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const workspaceId = useStringQuery("workspace");

  redirect(`/workspace/${workspaceId}/settings/profile`);
}
