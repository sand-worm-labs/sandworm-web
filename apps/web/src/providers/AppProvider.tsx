"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GOOGLE_CLIENT_ID } from "@/components/Visualization/utils/env";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID()}>
      {children}
    </GoogleOAuthProvider>
  );
}
