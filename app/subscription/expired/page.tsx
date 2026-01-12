"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

export default function SubscriptionExpiredPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"STARTER" | "GROWTH" | "PRO">("STARTER");
  const [selectedBilling, setSelectedBilling] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const handleResubscribe = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billing: selectedBilling,
          resubscribe: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Subscription Required
          </h1>

          <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
            Your subscription has expired or been canceled. Please reactivate your subscription to continue using GroomRoute.
          </p>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Choose Your Plan
            </h2>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className={`text-sm font-medium ${selectedBilling === "MONTHLY" ? "text-gray-900" : "text-gray-500"}`}>
                Monthly
              </span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={selectedBilling === "YEARLY"}
                onChange={(e) => setSelectedBilling(e.target.checked ? "YEARLY" : "MONTHLY")}
              />
              <span className={`text-sm font-medium ${selectedBilling === "YEARLY" ? "text-gray-900" : "text-gray-500"}`}>
                Yearly
                <span className="ml-1 text-xs text-green-600">(Save 20%)</span>
              </span>
            </div>

            {/* Plan Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Starter Plan */}
              <label
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === "STARTER"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="STARTER"
                  checked={selectedPlan === "STARTER"}
                  onChange={(e) => setSelectedPlan(e.target.value as "STARTER" | "GROWTH" | "PRO")}
                  className="sr-only"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-3">Perfect for solo groomers</p>
                  <div className="text-3xl font-bold text-gray-900">
                    ${selectedBilling === "MONTHLY" ? "79" : "79"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedBilling === "MONTHLY" ? "/month" : "/month"}
                  </div>
                  {selectedBilling === "YEARLY" && (
                    <div className="text-xs text-green-600 mt-1">
                      $950/year (save $200)
                    </div>
                  )}
                </div>
              </label>

              {/* Growth Plan */}
              <label
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === "GROWTH"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="GROWTH"
                  checked={selectedPlan === "GROWTH"}
                  onChange={(e) => setSelectedPlan(e.target.value as "STARTER" | "GROWTH" | "PRO")}
                  className="sr-only"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Growth</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-3">For growing businesses</p>
                  <div className="text-3xl font-bold text-gray-900">
                    ${selectedBilling === "MONTHLY" ? "179" : "142"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedBilling === "MONTHLY" ? "/month" : "/month"}
                  </div>
                  {selectedBilling === "YEARLY" && (
                    <div className="text-xs text-green-600 mt-1">
                      $1,700/year (save $448)
                    </div>
                  )}
                </div>
              </label>

              {/* Pro Plan */}
              <label
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan === "PRO"
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value="PRO"
                  checked={selectedPlan === "PRO"}
                  onChange={(e) => setSelectedPlan(e.target.value as "STARTER" | "GROWTH" | "PRO")}
                  className="sr-only"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-3">For established teams</p>
                  <div className="text-3xl font-bold text-gray-900">
                    ${selectedBilling === "MONTHLY" ? "279" : "221"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedBilling === "MONTHLY" ? "/month" : "/month"}
                  </div>
                  {selectedBilling === "YEARLY" && (
                    <div className="text-xs text-green-600 mt-1">
                      $2,650/year (save $698)
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 flex-1"
              disabled={isLoading}
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleResubscribe}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Processing...
                </>
              ) : (
                "Reactivate Subscription"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
