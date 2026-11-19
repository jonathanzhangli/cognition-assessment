import type { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { forbidden, redirect } from "next/navigation";
import { authConfig } from "./auth.config";
import { db } from "./db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize({ email, password }) {
      if (typeof email !== "string" || typeof password !== "string") return null;
      const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (!user || !await compare(password, user.passwordHash)) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  })],
});

export async function requireUser() {
  const session = await auth();
  if (!session?.user.id) redirect("/login");
  return session.user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) forbidden();
  return user;
}
