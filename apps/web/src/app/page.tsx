"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSession } from "@/components/Visualization/hooks/useAuth";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useSession({ redirectToLogin: true });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/workspace");
    }
  }, [loading, isAuthenticated, router]);

  return null;
}
