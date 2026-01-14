"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

const MAX_GROOMER_SEATS = 19; // Max 19 additional groomer seats

// Pricing constants for Pro plan
const PRO_BASE_PRICE_MONTHLY = 149;
const PRO_BASE_PRICE_YEARLY = 124;
const ADDITIONAL_ADMIN_SEAT_MONTHLY = 49;
const ADDITIONAL_ADMIN_SEAT_YEARLY = 41;
const GROOMER_SEAT_PRICE_MONTHLY = 29;
const GROOMER_SEAT_PRICE_YEARLY = 25;

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get plan and billing from URL params (default to Growth Monthly)
  const selectedPlan = searchParams.get("plan") || "growth";
  const selectedBilling = searchParams.get("billing") || "monthly";

  // Seat counts for Pro plan (base includes 1 admin, can add more)
  const [additionalAdminSeats, setAdditionalAdminSeats] = useState(0);
  const [groomerSeats, setGroomerSeats] = useState(0);
  const isProPlan = selectedPlan.toLowerCase() === "pro";

  // Calculate total monthly cost for Pro plan
  const basePrice = selectedBilling === "yearly" ? PRO_BASE_PRICE_YEARLY : PRO_BASE_PRICE_MONTHLY;
  const additionalAdminPrice = selectedBilling === "yearly" ? ADDITIONAL_ADMIN_SEAT_YEARLY : ADDITIONAL_ADMIN_SEAT_MONTHLY;
  const groomerPrice = selectedBilling === "yearly" ? GROOMER_SEAT_PRICE_YEARLY : GROOMER_SEAT_PRICE_MONTHLY;
  const monthlyTotal = basePrice + (additionalAdminSeats * additionalAdminPrice) + (groomerSeats * groomerPrice);
  const yearlyTotal = (PRO_BASE_PRICE_YEARLY * 12) + (additionalAdminSeats * ADDITIONAL_ADMIN_SEAT_YEARLY * 12) + (groomerSeats * GROOMER_SEAT_PRICE_YEARLY * 12);

  // Show error message if redirected from dashboard
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "subscription_required") {
      toast.error("Please complete payment to access your dashboard.");
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    plan: selectedPlan,
    billing: selectedBilling,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create account
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.error || "Failed to create account");
      }

      // Auto-login after signup
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please login manually.");
        router.push("/auth/signin");
        return;
      }

      // Create Stripe checkout session
      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: formData.plan.toLowerCase(),
          billing: formData.billing.toLowerCase(),
          ...(isProPlan && {
            additionalAdminSeats: additionalAdminSeats,
            groomerSeats: groomerSeats,
          }),
        }),
      });

      if (!checkoutResponse.ok) {
        const checkoutData = await checkoutResponse.json();
        throw new Error(checkoutData.error || "Failed to create checkout session");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600">
              Start optimizing your grooming routes today
            </p>
          </div>

          {/* Selected Plan Badge */}
          <div className="mb-6 p-4 bg-orange-50 border border-[#A5744A]/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Plan</p>
                <p className="text-base font-bold text-[#A5744A] capitalize">
                  {selectedPlan} - {selectedBilling === "yearly" ? "Yearly" : "Monthly"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#A5744A]">14-day free trial</p>
                <Link href="/#pricing" className="text-xs text-[#A5744A] hover:underline">
                  Change plan
                </Link>
              </div>
            </div>

            {/* Team Size Selector for Pro Plan */}
            {isProPlan && (
              <div className="mt-4 pt-4 border-t border-[#A5744A]/20 space-y-4">
                {/* Base Plan Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pro Base</p>
                    <p className="text-xs text-gray-500">Includes 1 admin seat with full access</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#A5744A]">${basePrice}/mo</span>
                  </div>
                </div>

                {/* Additional Admin Seats - Optional */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Extra Admin Seats</p>
                    <p className="text-xs text-gray-500">Full access (optional)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdditionalAdminSeats(Math.max(0, additionalAdminSeats - 1))}
                      disabled={additionalAdminSeats <= 0 || isLoading}
                      className="btn btn-sm btn-circle btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:border-[#A5744A] disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{additionalAdminSeats}</span>
                    <button
                      type="button"
                      onClick={() => setAdditionalAdminSeats(Math.min(5, additionalAdminSeats + 1))}
                      disabled={additionalAdminSeats >= 5 || isLoading}
                      className="btn btn-sm btn-circle btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:border-[#A5744A] disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-500 ml-1">× ${additionalAdminPrice}</span>
                  </div>
                </div>

                {/* Groomer Seats - Optional */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Groomer Seats</p>
                    <p className="text-xs text-gray-500">Schedule & route access only</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGroomerSeats(Math.max(0, groomerSeats - 1))}
                      disabled={groomerSeats <= 0 || isLoading}
                      className="btn btn-sm btn-circle btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:border-[#A5744A] disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{groomerSeats}</span>
                    <button
                      type="button"
                      onClick={() => setGroomerSeats(Math.min(MAX_GROOMER_SEATS, groomerSeats + 1))}
                      disabled={groomerSeats >= MAX_GROOMER_SEATS || isLoading}
                      className="btn btn-sm btn-circle btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:border-[#A5744A] disabled:opacity-40"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-500 ml-1">× ${groomerPrice}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-[#A5744A]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Total ({1 + additionalAdminSeats + groomerSeats} {1 + additionalAdminSeats + groomerSeats === 1 ? 'seat' : 'seats'})
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#A5744A]">${monthlyTotal}/month</span>
                      {selectedBilling === "yearly" && (
                        <p className="text-xs text-gray-500">(billed ${yearlyTotal}/year)</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 bg-gray-50"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                required
                className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 bg-gray-50"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 bg-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 bg-white"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-white bg-[#A5744A] hover:bg-[#8B6239] border-0 font-semibold"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
