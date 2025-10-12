"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Username } from "../Assets/Username";

const usernameSchema = z
  .string()
  .min(2, { message: "min" })
  .max(14, { message: "max" })
  .regex(/^[a-z0-9]+$/, { message: "chars" });

const taken = ["jessie", "elonmusk"];

export const ClaimUsername = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [invalid, setInvalid] = useState<{ length?: boolean; chars?: boolean }>(
    {}
  );
  const router = useRouter();
  const { claimUsername } = useSessionStore();

  // Example validation function (replace with API call later)
  const checkUsername = async (name: string) => {
    const parsed = usernameSchema.safeParse(name);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      const lengthErr = issues.some(
        i => i.code === "too_small" || i.code === "too_big"
      );
      const charsErr = issues.some(
        i => i.code === "invalid_string" && (i as any).validation === "regex"
      );
      setInvalid({ length: lengthErr, chars: charsErr });
      setStatus("invalid");
      return;
    }
    // clear invalid flags if validation passes
    setInvalid({});
    setStatus("checking");
    // fake delay
    await new Promise<void>(resolve => {
      setTimeout(resolve, 500);
    });
    // demo availability check
    if (taken.includes(name.toLowerCase())) {
      setStatus("taken");
    } else {
      setStatus("available");
    }
  };

  const handleSubmit = () => {
    if (status === "available") {
      claimUsername(username);
      router.push("/check-mail");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-10 py-6 overflow-hidden">
      <Username />
      <div className="w-full max-w-xl space-y-3 text-left mx-auto">
        <h2 className="text-xl font-semibold roobert mt-4">
          Claim your Username
        </h2>
        <p className="text-sm font-medium text-muted-foreground roobert max-w-xl">
          Your username is a subdomain where all your dashboards, queries and
          public works will live, it represents your identity across Sandworm.
        </p>

        <div className="space-y-4">
          <div className="flex gap-2 items-stretch">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              onBlur={() => checkUsername(username)}
              placeholder="Type a username"
              className="bg-[#F8F9FA] dark:bg-[#1A1A1A] text[#343A40] dark:text-white border-[#DEE2E6] py-6 rounded-xl roobert font-medium text-base"
            />
            <Button
              disabled={status !== "available"}
              onClick={handleSubmit}
              className="rounded-xl px-5 py-6 roobert disabled:bg-[#CED4DA] disabled:text-[#495057] bg-black"
            >
              Create Account
            </Button>
          </div>

          <ul className="text-xs roobert space-y-1 list-disc pl-4">
            {status === "taken" && (
              <li className="text-destructive">Username is unavailable</li>
            )}
            <li
              className={
                invalid.length ? "text-destructive" : "text-muted-foreground"
              }
            >
              Usernames should be less than 15 characters
            </li>
            <li
              className={
                invalid.chars ? "text-destructive" : "text-muted-foreground"
              }
            >
              Cannot contain punctuation/special marks
            </li>
          </ul>

          <div className="inline-block rounded-2xl p-[1.5px] bg-rainbow-gradient">
            <span className="block rounded-[14px] bg-[linear-gradient(180deg,#F1F8F8,#DCF4F4)] dark:bg-black px-8 py-6 text-2xl font-semibold text-muted-foreground">
              Sandworm/
              <span className="text-muted-foreground">
                {username || "username"}
              </span>
            </span>
          </div>
        </div>
      </div>
      <p className="roobert text-center text-xs text-muted-foreground mt-6">
        By creating an account you agree to the{" "}
        <span className="underline">Terms</span> and confirm that you have read
        the <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
};
