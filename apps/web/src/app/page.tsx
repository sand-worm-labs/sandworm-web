"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/components/Editor/hooks/useAuth";
import { Loader } from "@/components/Loader";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useSession({ redirectToLogin: false });

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace("/workspace");
    } else {
      router.replace("/signin");
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="loader-container h-screen">
      <Loader />
    </div>
  );
}
