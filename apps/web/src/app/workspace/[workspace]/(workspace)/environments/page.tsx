"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useStringQuery } from "@/components/Visualization/hooks/useQueryArgs";

export default function EnvironmentsPage() {
  const router = useRouter();
  const workspaceId = useStringQuery("workspace");

  useEffect(() => {
    router.push(`/workspace/${workspaceId}/environments/current`);
  }, [workspaceId, router]);

  return null;
}
