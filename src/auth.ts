import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { listDemoPersonas } from "@/lib/demo/seed";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

const demoUsers = listDemoPersonas().map((persona) => ({
  id: persona.id,
  name: persona.name,
  email: `${persona.id}@demo.local`,
}));

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? "development-nextauth-secret-change-me",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const demoPassword = process.env.DEMO_PASSWORD ?? "demo1234";
        const matchingUser = demoUsers.find((user) => user.email === email);

        if (matchingUser && password === demoPassword) {
          return matchingUser;
        }

        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin-user",
            name: "Competition Admin",
            email,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "");
      }
      return session;
    },
  },
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
