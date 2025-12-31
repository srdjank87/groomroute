"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type OnboardingStep = "address" | "hours" | "complete";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("address");
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

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("hours");
  };

  const handleHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Complete onboarding
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

      // Redirect to dashboard with setup success flag
      router.push("/dashboard?setup=success");
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
            <li className={`step ${["address", "hours"].includes(currentStep) ? "step-primary" : ""} text-gray-700 font-medium`}>
              Base Address
            </li>
            <li className={`step ${currentStep === "hours" ? "step-primary" : ""} text-gray-700 font-medium`}>
              Working Hours
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
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

              <button type="submit" className="btn btn-primary w-full text-white bg-blue-600 hover:bg-blue-700 border-0">
                Continue
              </button>
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
                    "Complete Setup"
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
