"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@sandworm/ui/components/dialog";

import { useModalStore } from "@/store/auth";

import { PartnersSection } from "../Partners";

import { SocialLogin } from "./SocialLogin";

export const SignInModal = () => {
  const { signInOpen, closeSignIn } = useModalStore();

  return (
    <Dialog open={signInOpen} onOpenChange={closeSignIn}>
      <DialogContent className="sm:max-w-3xl p-0 py-12 pb-5 overflow-hidden border-[#ffffff30] bg-white dark:bg-base-100 dark:text-white rounded-2xl ">
        <div className="grid grid-cols-6  h-full">
          <div className="col-span-3 flex flex-col justify-center p-8 pr-[6rem]">
            <DialogTitle>
              <span className="text-2xl font-sewmibold block mb-2 font-body ">
                Join Sandworm
              </span>
            </DialogTitle>

            <DialogDescription className=" mb-6 text-muted-foreground font-body  text-sm">
              Decode complex Onchain data in seconds!
            </DialogDescription>

            <SocialLogin />

            <PartnersSection />
          </div>

          <div className="col-span-3 relative hidden sm:block ">
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
