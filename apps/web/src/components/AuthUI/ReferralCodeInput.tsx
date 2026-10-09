"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { socialLinks } from "@/data/socialLinks";
import { getReferralCode, setReferralCode } from "@/utils/referral";

const DISCORD_URL =
  socialLinks.find(link => link.name === "Discord")?.href ??
  "https://discord.gg/pftQtpcjK2";

// =====================================
// ⬢ Referral Code Input
// =====================================
export const ReferralCodeInput = () => {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");

  // A /signup?ref=CODE link pre-fills the field.
  useEffect(() => {
    const initial = searchParams.get("ref") ?? getReferralCode() ?? "";
    setCode(initial);
    if (initial) setReferralCode(initial);
  }, [searchParams]);

  return (
    <div className="w-full mb-3">
      <input
        value={code}
        onChange={e => {
          setCode(e.target.value);
          setReferralCode(e.target.value);
        }}
        placeholder="Referral code"
        aria-label="Referral code"
        autoComplete="off"
        className="w-full rounded-md border border-border-secondary bg-transparent px-3 py-2 text-sm font-body text-black dark:text-white"
      />
      <p className="mt-1.5 text-center text-xs font-body text-ink-500 dark:text-ink-400">
        Need a referral code?
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent dark:text-primary hover:underline ml-1"
        >
          Join our Discord
        </a>{" "}
        and message us.
      </p>
    </div>
  );
};
