"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";

import { Input } from "@sandworm/ui/components/input";
import { Button } from "@sandworm/ui/components/button";

import { Username } from "../Assets/Username";

// ⚙️ Schema for username validation
// =====================================
const usernameSchema = z
  .string()
  .min(2, { message: "Username must be at least 2 characters." })
  .max(14, { message: "Username cannot exceed 14 characters." })
  .regex(/^[a-z0-9]+$/, {
    message: "Only lowercase letters and numbers are allowed.",
  });

// ⚛️ =====================================
// CLAIM USERNAME COMPONENT
// =====================================
export const ClaimUsername = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ⬢ Check Subdomain availability
  // =====================================
  const checkUsername = async (name: string) => {
    const validation = usernameSchema.safeParse(name);

    if (!validation.success) {
      setStatus("invalid");
      setError(validation.error.errors[0]?.message || "Invalid username");
      return;
    }

    setStatus("checking");
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    // 💭 for demo purpose only. we assume si name is taken
    if (name.toLowerCase() === "si") {
      setStatus("taken");
      setError("Username is already taken.");
    } else {
      setStatus("available");
    }
  };

  // ⬢ Handle Subdomain Claim Submission
  // =====================================
  const handleSubmit = () => {
    if (status === "available") {
      router.push("/check-mail");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 w-full">
      <Username />

      <div className="w-full max-w-md mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-bold roobert mt-4">
          Claim your Sandworm domain
        </h2>
        <p className="text-sm font-medium text-[#455768] dark:text-white roobert">
          Your username is your unique profile URL where all your dashboards,
          queries, and public works live. It represents your identity across
          Sandworm.
        </p>

        {/* ═══ Username Input Section ═══ */}
        <div className="space-y-2">
          <div className="flex mb-6">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => checkUsername(username)}
              placeholder="Enter username"
              className="bg-[#F8F9FA] dark:bg-[#1A1A1A] text-[#343A40] dark:text-white border-[#DEE2E6] py-6 rounded-xl roobert font-medium text-base"
            />
            <Button
              disabled={status !== "available"}
              onClick={handleSubmit}
              className="bg-black text-white rounded-lg ml-2 py-6 roobert"
            >
              Claim handle
            </Button>
          </div>

          {/* ═══ Username Preview ═══ */}
          <span className="text-xl text-[#D0DCE4]  green-gradient py-4 inline-block px-5 rounded-xl font-semibold mt-5 inline-block box-gradient">
            {username
              ? `${username}.sandwormlabs.xyz`
              : "username.sandwormlabs.xyz"}
          </span>

          {/* ═══ Validation Feedback ═══ */}
          {error && <p className="text-xs text-destructive roobert">{error}</p>}
          {status === "available" && (
            <p className="text-xs text-green-500 roobert">
              Username is available!
            </p>
          )}

          <ul className="text-xs roobert space-y-1 list-disc pl-4 text-left">
            <li
              className={
                username.length > 14
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              Must be 2–14 characters long
            </li>
            <li
              className={
                /[^a-z0-9]/.test(username)
                  ? "text-destructive"
                  : "text-muted-foreground"
              }
            >
              Only lowercase letters and numbers allowed
            </li>
          </ul>
        </div>
      </div>

      <p className="roobert text-center text-xs text-muted-foreground mt-6">
        By creating an account you agree to the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and confirm that you have read the{" "}
        <Link href="privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};
