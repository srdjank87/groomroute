"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type OnboardingStep = "groomer" | "address" | "hours" | "plan" | "complete";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("groomer");
  const [isLoading, setIsLoading] = useState(false);

  const [groomerData, setGroomerData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
  });

  const [addressData, setAddressData] = useState({
    baseAddress: "",
  });

  const [hoursData, setHoursData] = useState({
    workingHoursStart: "08:00",
    workingHoursEnd: "17:00",
  });

  const [planData, setPlanData] = useState({
    plan: "STARTER" as "STARTER" | "GROWTH" | "PRO",
    billing: "MONTHLY" as "MONTHLY" | "YEARLY",
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleGroomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("address");
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("hours");
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("plan");
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, complete onboarding
      const onboardingResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomer: groomerData,
          address: addressData,
          hours: hoursData,
        }),
      });

      if (!onboardingResponse.ok) {
        const data = await onboardingResponse.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      // Then, create Stripe checkout session
      const checkoutResponse = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planData.plan,
          billing: planData.billing,
        }),
      });

      if (!checkoutResponse.ok) {
        const data = await checkoutResponse.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await checkoutResponse.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to GroomRoute!
          </h1>
          <p className="text-gray-600">
            Let&apos;s set up your account in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <ul className="steps steps-horizontal w-full">
            <li className={`step ${["groomer", "address", "hours", "plan"].includes(currentStep) ? "step-primary" : ""}`}>
              Groomer Profile
            </li>
            <li className={`step ${["address", "hours", "plan"].includes(currentStep) ? "step-primary" : ""}`}>
              Base Address
            </li>
            <li className={`step ${["hours", "plan"].includes(currentStep) ? "step-primary" : ""}`}>
              Working Hours
            </li>
            <li className={`step ${currentStep === "plan" ? "step-primary" : ""}`}>
              Choose Plan
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === "groomer" && (
            <form onSubmit={handleGroomerSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Contact Information
              </h2>
              <p className="text-gray-600 mb-4">
                We&apos;ll use this to contact you about your grooming business.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full bg-gray-50"
                  value={groomerData.name}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  From your account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full bg-gray-50"
                  value={groomerData.email}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  From your account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  className="input input-bordered w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="(555) 123-4567"
                  value={groomerData.phone}
                  onChange={(e) => setGroomerData({ ...groomerData, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full text-white bg-blue-600 hover:bg-blue-700 border-0">
                Continue
              </button>
            </form>
          )}

          {currentStep === "address" && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Base Address
              </h2>
              <p className="text-gray-600 mb-4">
                This is where you start and end your routes each day.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <AddressAutocomplete
                  value={addressData.baseAddress}
                  onChange={(address) => setAddressData({ ...addressData, baseAddress: address })}
                  placeholder="Start typing your address..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing and select from the suggestions for accurate geocoding.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("groomer")}
                  className="btn btn-ghost flex-1 border-2 border-gray-300"
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary flex-1 text-white bg-blue-600 hover:bg-blue-700 border-0">
                  Continue
                </button>
              </div>
            </form>
          )}

          {currentStep === "hours" && (
            <form onSubmit={handleHoursSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Working Hours
              </h2>
              <p className="text-gray-600 mb-4">
                Set your typical working hours. You can adjust these anytime.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    className="input input-bordered w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={hoursData.workingHoursStart}
                    onChange={(e) => setHoursData({ ...hoursData, workingHoursStart: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    className="input input-bordered w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={hoursData.workingHoursEnd}
                    onChange={(e) => setHoursData({ ...hoursData, workingHoursEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("address")}
                  className="btn btn-ghost flex-1 border-2 border-gray-300"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-white bg-blue-600 hover:bg-blue-700 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Completing setup...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          )}

          {currentStep === "plan" && (
            <form onSubmit={handlePlanSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-gray-600 mb-4">
                Start with a 14-day free trial. No credit card required during trial.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`text-sm font-medium ${planData.billing === "MONTHLY" ? "text-gray-900" : "text-gray-500"}`}>
                  Monthly
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary border-2 border-blue-600 [--tglbg:theme(colors.blue.600)] checked:bg-blue-600 checked:border-blue-600"
                  checked={planData.billing === "YEARLY"}
                  onChange={(e) => setPlanData({ ...planData, billing: e.target.checked ? "YEARLY" : "MONTHLY" })}
                />
                <span className={`text-sm font-medium ${planData.billing === "YEARLY" ? "text-gray-900" : "text-gray-500"}`}>
                  Yearly
                  <span className="ml-1 text-xs text-green-600 font-semibold">(Save 20%)</span>
                </span>
              </div>

              {/* Plan Cards */}
              <div className="grid gap-4">
                {/* Starter Plan */}
                <label
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    planData.plan === "STARTER"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value="STARTER"
                    checked={planData.plan === "STARTER"}
                    onChange={(e) => setPlanData({ ...planData, plan: e.target.value as "STARTER" | "GROWTH" | "PRO" })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Starter</h3>
                      <p className="text-sm text-gray-600 mt-1">Perfect for solo groomers</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${planData.billing === "MONTHLY" ? "79" : "79"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {planData.billing === "MONTHLY" ? "/month" : "/month"}
                      </div>
                      {planData.billing === "YEARLY" && (
                        <div className="text-xs text-green-600">
                          $950/year (save $200)
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Growth Plan */}
                <label
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    planData.plan === "GROWTH"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value="GROWTH"
                    checked={planData.plan === "GROWTH"}
                    onChange={(e) => setPlanData({ ...planData, plan: e.target.value as "STARTER" | "GROWTH" | "PRO" })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Growth</h3>
                      <p className="text-sm text-gray-600 mt-1">For growing businesses</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${planData.billing === "MONTHLY" ? "179" : "142"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {planData.billing === "MONTHLY" ? "/month" : "/month"}
                      </div>
                      {planData.billing === "YEARLY" && (
                        <div className="text-xs text-green-600">
                          $1,700/year (save $448)
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                {/* Pro Plan */}
                <label
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    planData.plan === "PRO"
                      ? "border-primary bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value="PRO"
                    checked={planData.plan === "PRO"}
                    onChange={(e) => setPlanData({ ...planData, plan: e.target.value as "STARTER" | "GROWTH" | "PRO" })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Pro</h3>
                      <p className="text-sm text-gray-600 mt-1">For established teams</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${planData.billing === "MONTHLY" ? "279" : "221"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {planData.billing === "MONTHLY" ? "/month" : "/month"}
                      </div>
                      {planData.billing === "YEARLY" && (
                        <div className="text-xs text-green-600">
                          $2,650/year (save $698)
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("hours")}
                  className="btn btn-ghost flex-1 border-2 border-gray-300"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-white bg-blue-600 hover:bg-blue-700 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Starting trial...
                    </>
                  ) : (
                    "Start Free Trial"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
