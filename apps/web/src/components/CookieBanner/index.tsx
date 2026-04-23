"use client";

import { useState, useEffect } from "react";

// =====================================
// ⬢ Constants and Type
// =====================================
const CONSENT_KEY = "sandworm_cookie_consent";

type ConsentState = "accepted" | "declined" | null;

// =====================================
// ⬢ Utils
// =====================================
function getStoredConsent(): ConsentState {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? null;
}

function storeConsent(state: "accepted" | "declined"): void {
  localStorage.setItem(CONSENT_KEY, state);
}

// =====================================
// ⬢ Cookie Banner
// =====================================
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (getStoredConsent() !== null) return undefined;

    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  function dismiss(choice: "accepted" | "declined") {
    storeConsent(choice);
    setLeaving(true);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className={[
        "fixed bottom-6 right-[1.5rem] z-50 font-body",
        "w-[400px] max-w-[720px]",
        "bg-white border dark:border-border-secondary border-[#E9ECEF] rounded-2xl shadow-[0_4px_4px_0_#73768726] ",
        "flex flex-col  gap-4 px-5 py-2.5",
        leaving
          ? "animate-[cookieDown_0.28s_cubic-bezier(0.4,0,1,1)_forwards]"
          : "animate-[cookieUp_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]",
      ].join(" ")}
    >
      <h2 className="font-medium mt-2">Cookie Settings</h2>
      <p className="flex-1 text-[13px] leading-relaxed dark:text-ink-400 text-[#343A40] m-0 pr-2">
      We use essential functionality cookies to make the site work. If you accept, we may also use cookies to enhance your experience, measure ad performance and analyze. 
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-[#8053FE] hover:underline whitespace-nowrap font-medium font-body ml-1"
        >
          Learn more
        </a>
      </p>

      <div className=" gap-2 grid grid-cols-2 ">
        <button
          type="button"
          onClick={() => dismiss("accepted")}
          className="w-full text-[13px] font-medium px-5 py-2 rounded-full bg-[#0F0F0F] text-white border  hover:opacity-85 active:scale-[0.97] transition-all"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => dismiss("accepted")}
          className="w-full inline-block text-[13px] font-medium px-5 py-2 rounded-full bg-[#F8F9FA] text-ink-100  border  hover:opacity-85 active:scale-[0.97] transition-all"
        >
          Decline
        </button>
      </div>
    </div>
  );
}
