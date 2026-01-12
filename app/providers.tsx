"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { PostHogProvider } from "@/lib/posthog";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PostHogProvider>
        {children}
      </PostHogProvider>
    </SessionProvider>
  );
}
