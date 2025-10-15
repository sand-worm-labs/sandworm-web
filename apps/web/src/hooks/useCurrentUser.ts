import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        // NextAuth session returns shape { user?: { name?: string; email?: string; image?: string; id?: string } }
        setUser(data?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading };
}
