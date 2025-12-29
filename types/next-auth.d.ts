import { UserRole } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountId: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    accountId: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId: string;
    role: UserRole;
  }
}
