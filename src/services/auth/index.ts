"use server";

import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@auth/firebase-adapter";

import type { APIResponse } from "@/types";
import { db } from "@/services/firebase";

export const {
  handlers,
  signIn,
  signOut: signOutFn,
  auth,
} = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: FirestoreAdapter(db),
});

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
  return true;
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
  return true;
}

export async function signUpWithEmail(email: string, password: string) {
  console.log("signUpWithEmail", email, password);
  return true;
  // try {
  //   const userCreds = await createUserWithEmailAndPassword(
  //     auth,
  //     email,
  //     password
  //   );
  //   const idToken = await userCreds.user.getIdToken();
  //   const response = await fetch("/api/auth/sign-up", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ idToken }),
  //   });
  //   const resBody = (await response.json()) as APIResponse<string>;
  //   return response.ok && resBody.success;
  // } catch (error) {
  //   console.error("Error signing up with email:", error);
  //   return false;
  // }
}

export async function signInWithEmail(email: string, password: string) {
  console.log("signInWithEmail", email, password);
  return true;
  // try {
  //   const userCreds = await signInWithEmailAndPassword(auth, email, password);
  //   const idToken = await userCreds.user.getIdToken();
  //   const response = await fetch("/api/auth/sign-in", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ idToken }),
  //   });
  //   const resBody = (await response.json()) as APIResponse<string>;
  //   return response.ok && resBody.success;
  // } catch (error) {
  //   console.error("Error signing in with email:", error);
  //   return false;
  // }
}

export async function signOut() {
  await signOutFn();
  return true;
}
