"use client";

import { Toaster } from "sonner";

import { SignInModal } from "@/components/AuthUI/SignInModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SignInModal />
      <Toaster position="bottom-right" />
    </>
  );
}
