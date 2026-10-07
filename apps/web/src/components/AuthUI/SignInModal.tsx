"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import { CloseIconButton } from "@/components/CloseIconButton";
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
    <Transition show={signInOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeSignIn}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6 sm:p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-[0.98]"
            >
              <DialogPanel className="relative w-full max-w-md sm:max-w-3xl py-8 sm:py-12 pb-5 border border-white/[18.8%] bg-white dark:bg-base-100 dark:text-white rounded-2xl shadow-xl transition-all motion-reduce:transition-none">
                <CloseIconButton
                  onClick={closeSignIn}
                  className="absolute top-4 right-4"
                />

                <div className="flex flex-col sm:grid sm:grid-cols-6">
                  <div className="sm:col-span-3 flex flex-col justify-center p-6 sm:p-8 sm:pr-[6rem]">
                    <DialogTitle as="span" className="block mb-2">
                      <span className="text-2xl font-sewmibold block font-body">
                        Join Sandworm
                      </span>
                    </DialogTitle>

                    <Description className="mb-6 text-muted-foreground font-body text-sm">
                      Decode complex Onchain data in seconds!
                    </Description>

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

                  <div className="sm:col-span-3 relative hidden sm:block">
                    <Image
                      src="/img/unanimated-logoimg.svg"
                      alt="Sign in illustration"
                      width={394}
                      height={301}
                      className="object-cover"
                    />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
