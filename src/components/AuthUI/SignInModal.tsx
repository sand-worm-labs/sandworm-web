"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useModalStore } from "@/store/auth";

import { SocialLogin } from "./SocialLogin";

export const SignInModal = () => {
  const { signInOpen, closeSignIn } = useModalStore();

  return (
    <Dialog open={signInOpen} onOpenChange={closeSignIn}>
      <DialogContent className="sm:max-w-md bg-[#000] border-[#ffffff30] text-white">
        <DialogTitle>
          <h2 className="text-xl font-medium mt-4 text-center">Sign In</h2>
        </DialogTitle>

        <SocialLogin />

        <p className="mt-4 text-center text-sm text-gray-400">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            onClick={closeSignIn}
            className="text-orange-500 hover:underline"
          >
            Terms of Service
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
};
