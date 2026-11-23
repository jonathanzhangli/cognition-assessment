import type { NextAuthConfig } from "next-auth";

// Middleware only needs the session, not the database or password provider.
export const authConfig = {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    authorized: ({ auth }) => Boolean(auth?.user?.id),
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.id === "string" &&
        (token.role === "agent" || token.role === "manager" || token.role === "admin")) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
