"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@sandworm/ui/components/input";
import { Button } from "@sandworm/ui/components/button";

import { useCurrentUser } from "@/components/Editor/hooks/useCurrentUser";

import { Username } from "../Assets/Username";
import { Spinner } from "../Spinner/Spinner";

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
  error?: string | null;
}

export const ClaimUsernameStep = ({
  onSubmit,
  isLoading,
  error: submitError,
}: ClaimUsernameStepProps) => {
  const [username, setUsername] = useState("");

  const validation = usernameSchema.safeParse(username);
  const isValid = validation.success;
  const validationError =
    !isValid && username.length > 0
      ? (validation.error.errors[0]?.message ?? "Invalid username")
      : null;
  const error = validationError ?? submitError ?? null;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 w-full">
      <Username />

      <div className="w-full max-w-md mx-auto space-y-4 text-center">
        <h2 className="text-2xl font-bold font-primary text-ink-100 mt-4">
          Claim your Sandworm domain
        </h2>
        <p className="text-sm font-medium text-ink-200 dark:text-white font-body mb-4">
          Your username is your unique profile URL where all your dashboards,
          queries, and public works live. It represents your identity across
          Sandworm.
        </p>

        <div className="space-y-2">
          <div className="flex mb-6">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              className="bg-inputBg dark:bg-base-400 text-ink-500 dark:text-white border-border dark:border-border-tertiary dark:placeholder:text-ink-400 py-6 rounded-xl font-body font-medium text-base"
            />
            <Button
              disabled={!isValid || isLoading}
              onClick={() => onSubmit(username)}
              className="bg-black text-white rounded-lg ml-2 py-6 font-body disabled:bg-disabled disabled:text-border disabled:opacity-1 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Claiming...
                </>
              ) : (
                "Claim handle"
              )}
            </Button>
          </div>

          <div className="flex justify-center mt-5">
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="text-xl text-[#D0DCE4] green-gradient py-4 px-5 rounded-xl font-semibold box-gradient dark:bg-base-100 max-w-full truncate whitespace-nowrap overflow-hidden"
              title={
                username
                  ? `${username}.sandwormlabs.xyz`
                  : "username.sandwormlabs.xyz"
              }
            >
              {username
                ? `${username}.sandwormlabs.xyz`
                : "username.sandwormlabs.xyz"}
            </motion.span>
          </div>

          <div className="h-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key={error}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs text-destructive font-body"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <ul className="text-xs font-body space-y-1 list-disc pl-4 text-left text-ink-400">
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
// CLAIM USERNAME — standalone page wrapper
// =====================================
export const ClaimUsername = () => {
  const router = useRouter();
  const { updateUser } = useCurrentUser();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const onSubmit = async (username: string) => {
    setIsClaiming(true);
    setClaimError(null);
    try {
      await updateUser({ username });
      router.push("/workspace");
    } catch {
      setClaimError("That username is taken. Try another one.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 w-full">
      <ClaimUsernameStep
        onSubmit={onSubmit}
        isLoading={isClaiming}
        error={claimError}
      />

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
