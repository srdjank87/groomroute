import { UserRole, SubscriptionStatus, SubscriptionPlan } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountId: string;
      role: UserRole;
      groomerId?: string | null;
      subscriptionStatus?: SubscriptionStatus;
      subscriptionPlan?: SubscriptionPlan;
      currentPeriodEnd?: string;
      trialEndsAt?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accountId: string;
    role: UserRole;
    groomerId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId: string;
    role: UserRole;
    groomerId?: string | null;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionPlan?: SubscriptionPlan;
    currentPeriodEnd?: string;
    trialEndsAt?: string;
  }
}
