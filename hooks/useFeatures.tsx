"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { SubscriptionPlan } from "@prisma/client";
import { hasFeature, Feature, getPlanLimits } from "@/lib/features";

interface UseFeatureReturn {
  hasAccess: boolean;
  hasFeature: boolean; // Alias for hasAccess for convenience
  isLoading: boolean;
  plan: SubscriptionPlan | null;
}

interface UseFeaturesReturn {
  plan: SubscriptionPlan | null;
  isLoading: boolean;
  hasFeature: (feature: Feature) => boolean;
  canAddGroomer: (currentCount: number) => boolean;
  canAddCustomer: (currentCount: number) => boolean;
  limits: ReturnType<typeof getPlanLimits> | null;
}

/**
 * Hook to check if user has access to a specific feature
 */
export function useFeature(feature: Feature): UseFeatureReturn {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (status === "loading") return;

      if (!session?.user?.accountId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setPlan(data.subscriptionPlan || "TRIAL");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [session, status]);

  const hasAccess = plan ? hasFeature(plan, feature) : false;

  return { hasAccess, hasFeature: hasAccess, isLoading, plan };
}

/**
 * Hook to get all feature access helpers
 */
export function useFeatures(): UseFeaturesReturn {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      if (status === "loading") return;

      if (!session?.user?.accountId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/subscription");
        if (response.ok) {
          const data = await response.json();
          setPlan(data.subscriptionPlan || "TRIAL");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [session, status]);

  const limits = plan ? getPlanLimits(plan) : null;

  return {
    plan,
    isLoading,
    hasFeature: (feature: Feature) => (plan ? hasFeature(plan, feature) : false),
    canAddGroomer: (currentCount: number) =>
      limits ? currentCount < limits.maxGroomers : false,
    canAddCustomer: (currentCount: number) =>
      limits ? currentCount < limits.maxCustomers : false,
    limits,
  };
}

/**
 * Component to conditionally render content based on feature access
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasAccess, isLoading } = useFeature(feature);

  if (isLoading) return null;
  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
