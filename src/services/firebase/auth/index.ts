import {
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import type { APIResponse } from "@/types";

import { auth } from "../client";

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const userCreds = await signInWithPopup(auth, provider);
    const idToken = await userCreds.user.getIdToken();

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;
    return response.ok && resBody.success;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return false;
  }
}

export async function signInWithGitHub() {
  const provider = new GithubAuthProvider();

  try {
    const userCreds = await signInWithPopup(auth, provider);
    const idToken = await userCreds.user.getIdToken();

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;
    return response.ok && resBody.success;
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    return false;
  }
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    const userCreds = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await userCreds.user.getIdToken();

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;
    return response.ok && resBody.success;
  } catch (error) {
    console.error("Error signing up with email:", error);
    return false;
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCreds.user.getIdToken();

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const resBody = (await response.json()) as APIResponse<string>;
    return response.ok && resBody.success;
  } catch (error) {
    console.error("Error signing in with email:", error);
    return false;
  }
}

export async function signOut() {
  try {
    await auth.signOut();

    const response = await fetch("/api/auth/sign-out", {
      headers: { "Content-Type": "application/json" },
    });

    const resBody = (await response.json()) as APIResponse<string>;
    return response.ok && resBody.success;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
}
