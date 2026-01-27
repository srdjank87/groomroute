"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AddressAutocomplete from "@/components/AddressAutocomplete";

type OnboardingStep = "address" | "hours" | "preferences" | "workload" | "complete";

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

  // Helper to convert 24hr to 12hr format for display
  const formatTime12hr = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Time options for dropdowns
  const timeOptions = [
    { value: "06:00", label: "6:00 AM" },
    { value: "06:30", label: "6:30 AM" },
    { value: "07:00", label: "7:00 AM" },
    { value: "07:30", label: "7:30 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "08:30", label: "8:30 AM" },
    { value: "09:00", label: "9:00 AM" },
    { value: "09:30", label: "9:30 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "10:30", label: "10:30 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "11:30", label: "11:30 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "12:30", label: "12:30 PM" },
    { value: "13:00", label: "1:00 PM" },
    { value: "13:30", label: "1:30 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "14:30", label: "2:30 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "15:30", label: "3:30 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "16:30", label: "4:30 PM" },
    { value: "17:00", label: "5:00 PM" },
    { value: "17:30", label: "5:30 PM" },
    { value: "18:00", label: "6:00 PM" },
    { value: "18:30", label: "6:30 PM" },
    { value: "19:00", label: "7:00 PM" },
    { value: "19:30", label: "7:30 PM" },
    { value: "20:00", label: "8:00 PM" },
    { value: "20:30", label: "8:30 PM" },
    { value: "21:00", label: "9:00 PM" },
  ];

  const [contactMethods] = useState<string[]>(["call", "sms"]);
  const [preferredMessaging, setPreferredMessaging] = useState<"SMS" | "WHATSAPP">("SMS");
  const [preferredMaps, setPreferredMaps] = useState<"GOOGLE" | "APPLE">("GOOGLE");
  const [largeDogLimit, setLargeDogLimit] = useState<string>("");


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
    setCurrentStep("preferences");
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep("workload");
  };

  const handleWorkloadSubmit = async (e: React.FormEvent) => {
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
          preferredMessaging,
          preferredMaps,
          largeDogDailyLimit: largeDogLimit === "" ? null : parseInt(largeDogLimit),
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

  // Step configuration for progress bar
  const steps = [
    { id: "address", label: "Address" },
    { id: "hours", label: "Hours" },
    { id: "preferences", label: "Apps" },
    { id: "workload", label: "Workload" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

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

        {/* Progress Steps - Custom styled for brand */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            {/* Progress line background */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 rounded-full mx-8" />
            {/* Progress line filled */}
            <div
              className="absolute top-5 left-0 h-1 bg-[#A5744A] rounded-full mx-8 transition-all duration-300"
              style={{ width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 4rem)` }}
            />

            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#A5744A] text-white"
                        : isCurrent
                          ? "bg-[#A5744A] text-white ring-4 ring-[#A5744A]/30"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    isCompleted || isCurrent ? "text-[#A5744A]" : "text-gray-500"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
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
                  <select
                    required
                    className="select select-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 pl-4"
                    value={hoursData.workingHoursStart}
                    onChange={(e) => setHoursData({ ...hoursData, workingHoursStart: e.target.value })}
                  >
                    {timeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    required
                    className="select select-bordered w-full border-2 border-gray-300 focus:border-[#A5744A] focus:ring-2 focus:ring-[#A5744A]/20 pl-4"
                    value={hoursData.workingHoursEnd}
                    onChange={(e) => setHoursData({ ...hoursData, workingHoursEnd: e.target.value })}
                  >
                    {timeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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

          {currentStep === "preferences" && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                App Preferences
              </h2>
              <p className="text-gray-600 mb-4">
                Choose your preferred apps for messaging and navigation.
              </p>

              {/* Messaging Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Messaging App
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Which messaging button would you like to see on appointment cards?
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPreferredMessaging("SMS")}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                      preferredMessaging === "SMS"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">SMS / Text</span>
                      <p className="text-sm text-gray-500">Standard text messaging</p>
                    </div>
                    {preferredMessaging === "SMS" && (
                      <span className="ml-auto text-[#A5744A]">✓</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredMessaging("WHATSAPP")}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                      preferredMessaging === "WHATSAPP"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">WhatsApp</span>
                      <p className="text-sm text-gray-500">WhatsApp messaging</p>
                    </div>
                    {preferredMessaging === "WHATSAPP" && (
                      <span className="ml-auto text-[#A5744A]">✓</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Maps Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Maps App
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Which maps app would you like to use for navigation?
                </p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPreferredMaps("GOOGLE")}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                      preferredMaps === "GOOGLE"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <svg viewBox="0 0 92.3 132.3" className="w-full h-full">
                        <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                        <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                        <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3"/>
                        <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"/>
                        <path fill="#34a853" d="M59.2 109.2c15.4-24.1 33.3-35 33.3-63.1 0-9.1-2.6-17.8-7.4-25.1l-61.6 73.3c3.5 4.6 6.7 9.6 9.1 15.1 4.6 10.6 5.1 19.4 5.1 19.4h17.3s-.3-8.8 4.2-19.6"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Google Maps</span>
                      <p className="text-sm text-gray-500">Works on all devices</p>
                    </div>
                    {preferredMaps === "GOOGLE" && (
                      <span className="ml-auto text-[#A5744A]">✓</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredMaps("APPLE")}
                    className={`w-full p-4 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                      preferredMaps === "APPLE"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <svg viewBox="0 0 50 50" className="w-6 h-6">
                        <path fill="#48c74a" d="M25 2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2z"/>
                        <path fill="#359846" d="M25 4c11.6 0 21 9.4 21 21s-9.4 21-21 21S4 36.6 4 25 13.4 4 25 4m0-2C12.3 2 2 12.3 2 25s10.3 23 23 23 23-10.3 23-23S37.7 2 25 2z"/>
                        <path fill="#fff" d="M25 8c-9.4 0-17 7.6-17 17s7.6 17 17 17 17-7.6 17-17S34.4 8 25 8zm0 31c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14-6.3 14-14 14z"/>
                        <path fill="#ff3b2f" d="M25 13l-2 6h-6l5 4-2 6 5-4 5 4-2-6 5-4h-6z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">Apple Maps</span>
                      <p className="text-sm text-gray-500">Best for iOS devices</p>
                    </div>
                    {preferredMaps === "APPLE" && (
                      <span className="ml-auto text-[#A5744A]">✓</span>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                You can change these anytime in Settings → Profile.
              </p>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep("hours")}
                  className="btn btn-ghost flex-1 border-2 border-gray-300"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-white bg-[#A5744A] hover:bg-[#8B6239] border-0"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {currentStep === "workload" && (
            <form onSubmit={handleWorkloadSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Workload Preferences
              </h2>
              <p className="text-gray-600 mb-4">
                Set limits to protect your energy and prevent overexertion.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Large Dog Daily Limit
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Dogs over 50 lbs are considered large dogs. Set a limit to get warnings when booking too many large dogs on the same day.
                </p>

                <div className="space-y-3">
                  {[
                    { value: "", label: "No limit", description: "I can handle any number of large dogs" },
                    { value: "1", label: "1 large dog", description: "Best for solo groomers or lighter workloads" },
                    { value: "2", label: "2 large dogs", description: "Good balance for most groomers" },
                    { value: "3", label: "3 large dogs", description: "For experienced groomers" },
                    { value: "4", label: "4 large dogs", description: "High capacity" },
                    { value: "5", label: "5 large dogs", description: "Maximum recommended" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLargeDogLimit(option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                        largeDogLimit === option.value
                          ? "border-[#A5744A] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                      <span className="text-sm text-gray-500 ml-2">- {option.description}</span>
                      {largeDogLimit === option.value && (
                        <span className="float-right text-[#A5744A]">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  You can change this anytime in Settings → Profile.
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep("preferences")}
                  className="btn btn-ghost flex-1 border-2 border-gray-300"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 text-white bg-[#A5744A] hover:bg-[#8B6239] border-0 min-w-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="truncate">Setting up...</span>
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
