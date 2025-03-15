"use server";

import NextAuth from "next-auth";
import Providers from "next-auth/providers";
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

    Providers.Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any, req: any) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const res = await fetch("/your/endpoint", {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();

        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
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
