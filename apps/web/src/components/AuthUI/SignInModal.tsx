"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@sandworm/ui/components/dialog";

import { useModalStore } from "@/store/auth";

import { PartnersSection } from "../Partners";

import { ReferralCodeInput } from "./ReferralCodeInput";
import { SocialLogin } from "./SocialLogin";

// =====================================
// ⬢ SignIn Modal
// =====================================
export const SignInModal = () => {
  const { signInOpen, closeSignIn } = useModalStore();

  return (
    <Dialog open={signInOpen} onOpenChange={closeSignIn}>
      <DialogContent className="block sm:max-w-3xl p-0 py-8 sm:py-12 pb-5 max-h-[calc(100dvh-2rem)] overflow-y-auto border-white/[18.8%] bg-white dark:bg-base-100 dark:text-white rounded-2xl ">
        <div className="flex flex-col sm:grid sm:grid-cols-6">
          <div className="sm:col-span-3 flex flex-col justify-center p-6 sm:p-8 sm:pr-[6rem]">
            <DialogTitle>
              <span className="text-2xl font-sewmibold block mb-2 font-body ">
                Join Sandworm
              </span>
            </DialogTitle>

            <DialogDescription className=" mb-6 text-muted-foreground font-body  text-sm">
              Decode complex Onchain data in seconds!
            </DialogDescription>

            <SocialLogin />

            <ReferralCodeInput />

            <p className="text-center text-ink-500 dark:text-ink-400 font-body text-sm mb-4">
              Have an account?
              <Link
                href="/signin"
                onClick={closeSignIn}
                className="text-accent dark:text-primary hover:underline ml-1"
              >
                Sign In
              </Link>
            </p>

            <PartnersSection />
          </div>

          <div className="sm:col-span-3 relative hidden sm:block ">
            <Image
              src="/img/unanimated-logoimg.svg"
              alt="Sign in illustration"
              width={394}
              height={301}
              className="object-cover"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
