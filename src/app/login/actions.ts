"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function login(_: string, form: FormData) {
  try {
    await signIn("credentials", {
      email: form.get("email"), password: form.get("password"), redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") return "Email or password is incorrect.";
    throw error;
  }
  return "";
}
