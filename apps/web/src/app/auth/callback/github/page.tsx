"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// =====================================
// ⬢ GitHub OAuth Popup Callback
// =====================================
export default function GithubOAuthCallbackPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const error =
      searchParams.get("error_description") || searchParams.get("error");

    if (window.opener) {
      if (code) {
        window.opener.postMessage(
          { type: "oauth-success", provider: "github", code },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          {
            type: "oauth-error",
            provider: "github",
            error: error ?? "Authorization failed",
          },
          window.location.origin
        );
      }
    }

    window.close();
  }, [searchParams]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black font-body text-sm text-[#7D8791]">
      Completing sign in…
    </div>
  );
}
