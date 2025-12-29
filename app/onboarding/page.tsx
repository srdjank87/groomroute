"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type OnboardingStep = "groomer" | "address" | "hours" | "complete";

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
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomer: groomerData,
          address: addressData,
          hours: hoursData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to complete onboarding");
      }

      toast.success("Setup complete! Welcome to GroomRoute");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
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
            Let's set up your account in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <ul className="steps steps-horizontal w-full">
            <li className={`step ${currentStep !== "groomer" ? "step-primary" : ""}`}>
              Groomer Profile
            </li>
            <li className={`step ${["hours", "complete"].includes(currentStep) ? "step-primary" : ""}`}>
              Base Address
            </li>
            <li className={`step ${currentStep === "complete" ? "step-primary" : ""}`}>
              Working Hours
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
                We'll use this to contact you about your grooming business.
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
                  className="input input-bordered w-full"
                  placeholder="(555) 123-4567"
                  value={groomerData.phone}
                  onChange={(e) => setGroomerData({ ...groomerData, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
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
                  className="btn btn-ghost flex-1"
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary flex-1">
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
                    className="input input-bordered w-full"
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
                    className="input input-bordered w-full"
                    value={hoursData.workingHoursEnd}
                    onChange={(e) => setHoursData({ ...hoursData, workingHoursEnd: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep("address")}
                  className="btn btn-ghost flex-1"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
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
