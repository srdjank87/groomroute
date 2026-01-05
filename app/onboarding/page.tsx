"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type OnboardingStep = "address" | "hours" | "contact" | "complete";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("address");
  const [isLoading, setIsLoading] = useState(false);

  const [groomerData, setGroomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Update groomer data when session loads
  useEffect(() => {
    if (session?.user) {
      setGroomerData({
        name: session.user.name || "",
        email: session.user.email || "",
        phone: "",
      });
    }
  }, [session]);

  const [addressData, setAddressData] = useState({
    baseAddress: "",
  });

  const [hoursData, setHoursData] = useState({
    workingHoursStart: "08:00",
    workingHoursEnd: "17:00",
  });

  const [contactMethods, setContactMethods] = useState<string[]>(["call", "sms"]);


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
    setCurrentStep("contact");
  };

  const toggleContactMethod = (method: string) => {
    setContactMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
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
          contactMethods,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
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
            <li className={`step ${currentStep !== "address" ? "step-primary" : ""} text-gray-700 font-medium`}>
              Base Address
            </li>
            <li className={`step ${currentStep === "hours" || currentStep === "contact" ? "step-primary" : ""} text-gray-700 font-medium`}>
              Working Hours
            </li>
            <li className={`step ${currentStep === "contact" ? "step-primary" : ""} text-gray-700 font-medium`}>
              Contact Methods
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

              <button type="submit" className="btn btn-primary w-full text-white bg-[#A5744A] hover:bg-[#8B6239] border-0">
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
                    className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20"
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
                    className="input input-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20"
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
                  className="btn btn-primary flex-1 text-white bg-[#A5744A] hover:bg-[#8B6239] border-0"
                  disabled={isLoading}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {currentStep === "contact" && (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contact Methods
              </h2>
              <p className="text-gray-600 mb-4">
                How do you prefer to contact your customers? Select all that apply.
              </p>

              <div className="space-y-3">
                {[
                  { value: "call", label: "Phone Call", icon: "📞" },
                  { value: "sms", label: "SMS / Text", icon: "💬" },
                  { value: "whatsapp", label: "WhatsApp", icon: "💚" },
                  { value: "signal", label: "Signal", icon: "🔵" },
                  { value: "telegram", label: "Telegram", icon: "✈️" },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => toggleContactMethod(method.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                      contactMethods.includes(method.value)
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-medium text-gray-900">{method.label}</span>
                    {contactMethods.includes(method.value) && (
                      <span className="ml-auto text-[#A5744A]">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
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
                  className="btn btn-primary flex-1 text-white bg-[#A5744A] hover:bg-[#8B6239] border-0"
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
