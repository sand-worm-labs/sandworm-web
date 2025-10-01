"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Username } from "../Assets/Username";

export const ClaimUsername = () => {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");

  // Example validation function (replace with API call later)
  const checkUsername = async (name: string) => {
    if (!/^[a-z0-9-]+$/.test(name)) {
      setStatus("invalid");
      return;
    }
    setStatus("checking");
    // fake delay
    await new Promise<void>(resolve => {
      setTimeout(resolve, 500);
    });
    // demo availability check
    if (name.toLowerCase() === "si") {
      setStatus("taken");
    } else {
      setStatus("available");
    }
  };

  const handleSubmit = () => {
    if (status === "available") {
      // call API to claim username
      console.log("Claiming username:", username);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <Username />
      <div className="w-full max-w-md space-y-3 text-center mx-auto">
        <h2 className="text-2xl font-bold roobert mt-4">
          Claim your Sandworm domain
        </h2>
        <p className="text-sm font-medium text-[#455768] dark:text-white roobert">
          Your username is your unique profile url where all your dashboards,
          queries and public works will live, it represents your identity across
          Sandworm.
        </p>

        <div className="space-y-2 ">
          <div className="flex">
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onBlur={() => checkUsername(username)}
              placeholder="Enter username"
              className="bg-[#F8F9FA] dark:bg-[#1A1A1A] text[#343A40] dark:text-white border-[#DEE2E6] py-6 rounded-xl roobert font-medium text-base"
            />
            <Button
              disabled={status !== "available"}
              onClick={handleSubmit}
              className="bg-black rounded-xl ml-2 py-6 roobert"
            >
              Claim handle
            </Button>
          </div>

          <span className="text-lg text-[#D0DCE4]  green-gradient py-4 inline-block px-5 rounded-xl font-semibold mt-3 box-gradient">
            {username
              ? `${username}.sandwormlabs.xyz`
              : "username.sandwormlabs.xyz"}
          </span>
          {status === "checking" && (
            <p className="text-xs text-yellow-600">Checking availability…</p>
          )}
          {status === "available" && (
            <p className="text-xs text-green-600">✅ Available</p>
          )}
          {status === "taken" && (
            <p className="text-xs text-red-600">❌ Already taken</p>
          )}
          {status === "invalid" && (
            <p className="text-xs text-red-600">
              ⚠ Only letters, numbers, and hyphens allowed
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 flex-end ">
          <Button
            variant="ghost"
            className="text-xs roobert font-medium inline-block"
          >
            Skip for now
          </Button>
        </div>
      </div>
      <p className="roobert text-center text-sm max-w-[25rem]">
        By creating an account you agree to the Terms and confirm that you have
        read the Privacy Policy.
      </p>
    </div>
  );
};
