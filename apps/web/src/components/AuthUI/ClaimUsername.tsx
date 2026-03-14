"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Input } from "@sandworm/ui/components/input";
import { Button } from "@sandworm/ui/components/button";

import { Username } from "../Assets/Username";

const usernameSchema = z
  .string()
  .min(2, { message: "Username must be at least 2 characters." })
  .max(14, { message: "Username cannot exceed 14 characters." })
  .regex(/^[a-z0-9]+$/, {
    message: "Only lowercase letters and numbers are allowed.",
  });

// ⚛️ =====================================
// CLAIM USERNAME STEP — embeddable, no outer layout
// =====================================
interface ClaimUsernameStepProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export const ClaimUsernameStep = ({
  onSubmit,
  isLoading,
}: ClaimUsernameStepProps) => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const checkUsername = async (name: string) => {
    const validation = usernameSchema.safeParse(name);

    if (!validation.success) {
      setStatus("invalid");
      setError(validation.error.errors[0]?.message || "Invalid username");
      return;
    }

    setStatus("checking");
    setError(null);

    await new Promise<void>(resolve => setTimeout(resolve, 500));

    if (name.toLowerCase() === "si") {
      setStatus("taken");
      setError("Username is already taken.");
    } else {
      setStatus("available");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 w-full">
      <Username />

      <div className="w-full max-w-md mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-bold font-primary  text-ink-100 mt-4">
          Claim your Sandworm domain
        </h2>
        <p className="text-sm font-medium text-ink-200 dark:text-white font-body  mb-4">
          Your username is your unique profile URL where all your dashboards,
          queries, and public works live. It represents your identity across
          Sandworm.
        </p>

        <div className="space-y-2">
          <div className="flex mb-6">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => checkUsername(username)}
              placeholder="Enter username"
              className="bg-[#F8F9FA] dark:bg-[#1A1A1A] text-ink-500 dark:text-white border-[#DEE2E6] dark:border-border-tertiary py-6 rounded-xl font-body  font-medium text-base"
            />
            <Button
              disabled={status !== "available" || isLoading}
              onClick={() => onSubmit(username)}
              className="bg-black text-white rounded-lg ml-2 py-6 font-body  disabled:bg-[#868E96] disabled:text-[#DEE2E6] disabled:opacity-1"
            >
              {isLoading ? "Creating..." : "Claim handle"}
            </Button>
          </div>

          <span
            className="text-xl text-[#D0DCE4] green-gradient py-4 px-5 rounded-xl font-semibold mt-5 inline-block box-gradient dark:bg-base-100  max-w-full truncate whitespace-nowrap overflow-hidden"
            title={
              username
                ? `${username}.sandwormlabs.xyz`
                : "username.sandwormlabs.xyz"
            }
          >
            {username
              ? `${username}.sandwormlabs.xyz`
              : "username.sandwormlabs.xyz"}
          </span>

          {error && (
            <p className="text-xs text-destructive font-body ">{error}</p>
          )}
          {status === "available" && (
            <p className="text-xs text-green-500 font-body ">
              Username is available!
            </p>
          )}

          <ul className="text-xs font-body  space-y-1 list-disc pl-4 text-left text-ink-400">
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
    </div>
  );
};

// ⚛️ =====================================
// CLAIM USERNAME — standalone page wrapper (unchanged behaviour)
// =====================================
export const ClaimUsername = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 w-full">
      <ClaimUsernameStep onSubmit={() => router.push("/check-mail")} />

      <div className="flex-col gap-2 absolute bottom-[4rem] w-full flex items-center justify-center">
        <p className="font-body  text-center text-xs text-ink-400 md:max-w-[300px] mt-6">
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
    </div>
  );
};
