"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { getReferralCode, setReferralCode } from "@/utils/referral";

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
    <input
      value={code}
      onChange={e => {
        setCode(e.target.value);
        setReferralCode(e.target.value);
      }}
      placeholder="Referral code"
      aria-label="Referral code"
      autoComplete="off"
      className="w-full mb-3 rounded-md border border-border-secondary bg-transparent px-3 py-2 text-sm font-body text-black dark:text-white"
    />
  );
};
