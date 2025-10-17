"use client";

import Image from "next/image";

export const CheckMail = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-10 py-6 overflow-hidden text-center">
      <div className="w-12 h-12 rounded-xl bg-[#EDE7FF] flex items-center justify-center mb-4">
        <Image src="/img/mail.png" width={24} height={24} alt="mail" />
      </div>
      <h2 className="text-xl font-semibold roobert">Check your Mail!</h2>
      <p className="text-sm font-medium text-muted-foreground dark:text-white font-primarymax-w-md mt-2">
        Congrats! Please click the link sent to your{" "}
        <span className="font-semibold">email</span> to complete your account
        creation process.
      </p>
      <p className="text-sm font-primary mt-2">
        Did not get an email?{" "}
        <span className="text-[#8053FE] underline cursor-pointer">Resend</span>
      </p>
      <p className="font-primarytext-center text-xs text-muted-foreground mt-6">
        By creating an account you agree to the{" "}
        <span className="underline">Terms</span> and confirm that you have read
        the <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
};
