import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole, SubscriptionStatus, SubscriptionPlan } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            account: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accountId: user.accountId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accountId = user.accountId;
        token.role = user.role;
      }

      // Fetch fresh subscription data on each request
      if (token.accountId && (trigger === "update" || !token.subscriptionStatus)) {
        const account = await prisma.account.findUnique({
          where: { id: token.accountId as string },
          select: {
            subscriptionStatus: true,
            subscriptionPlan: true,
            currentPeriodEnd: true,
            trialEndsAt: true,
          },
        });

        if (account) {
          token.subscriptionStatus = account.subscriptionStatus;
          token.subscriptionPlan = account.subscriptionPlan;
          token.currentPeriodEnd = account.currentPeriodEnd?.toISOString();
          token.trialEndsAt = account.trialEndsAt?.toISOString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.accountId = token.accountId as string;
        session.user.role = token.role as UserRole;
        session.user.subscriptionStatus = token.subscriptionStatus as SubscriptionStatus | undefined;
        session.user.subscriptionPlan = token.subscriptionPlan as SubscriptionPlan | undefined;
        session.user.currentPeriodEnd = token.currentPeriodEnd as string | undefined;
        session.user.trialEndsAt = token.trialEndsAt as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
