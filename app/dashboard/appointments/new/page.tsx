"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Plus, Check, Calendar as CalendarIcon, MapPin, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Step = "customer" | "pet" | "datetime" | "details";

interface Customer {
  id: string;
  name: string;
  address: string;
  phone?: string;
  pets: Pet[];
}

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  weight?: number;
  behaviorFlags?: string[];
}

interface AreaDaySuggestion {
  customer: {
    serviceAreaId: string | null;
    serviceAreaName: string | null;
    serviceAreaColor: string | null;
  };
  suggestedDays: number[];
  nextSuggestedDate: string | null;
  reason: string | null;
}

interface LargeDogCheck {
  date: string;
  largeDogCount: number;
  limit: number | null;
  hasLimit: boolean;
  atLimit: boolean;
  overLimit: boolean;
  remainingSlots: number | null;
}

interface WorkingHoursCheck {
  time: string;
  duration: number;
  workingHours: {
    start: string;
    end: string;
    startFormatted: string;
    endFormatted: string;
  };
  isWithinWorkingHours: boolean;
  startsBeforeWorkday: boolean;
  startsAfterWorkday: boolean;
  endsAfterWorkday: boolean;
  minutesOutside: number;
  outsideReason: string;
}

const LARGE_DOG_WEIGHT_THRESHOLD = 50;

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCustomerId = searchParams.get("customerId");

  const [currentStep, setCurrentStep] = useState<Step>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [appointmentData, setAppointmentData] = useState({
    customerId: preSelectedCustomerId || "",
    petId: "",
    date: "",
    time: "",
    serviceType: "FULL_GROOM",
    serviceMinutes: 90,
    price: 85,
    notes: "",
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [areaSuggestion, setAreaSuggestion] = useState<AreaDaySuggestion | null>(null);
  const [groomerId, setGroomerId] = useState<string | null>(null);
  const [largeDogCheck, setLargeDogCheck] = useState<LargeDogCheck | null>(null);
  const [largeDogWarningDismissed, setLargeDogWarningDismissed] = useState(false);
  const [workingHoursCheck, setWorkingHoursCheck] = useState<WorkingHoursCheck | null>(null);
  const [workingHoursWarningDismissed, setWorkingHoursWarningDismissed] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  }, [searchQuery]);

  // Fetch area day suggestion for selected customer
  const fetchAreaSuggestion = useCallback(async (customerId: string, currentGroomerId: string) => {
    try {
      const response = await fetch(
        `/api/appointments/suggest-date?customerId=${customerId}&groomerId=${currentGroomerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAreaSuggestion(data);
      }
    } catch (error) {
      console.error("Failed to fetch area suggestion:", error);
    }
  }, []);

  // Fetch large dog count for a date
  const fetchLargeDogCheck = useCallback(async (date: string) => {
    try {
      const response = await fetch(`/api/groomer/large-dog-count?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setLargeDogCheck(data);
        setLargeDogWarningDismissed(false); // Reset dismissal when date changes
      }
    } catch (error) {
      console.error("Failed to fetch large dog count:", error);
    }
  }, []);

  // Fetch working hours check for a time
  const fetchWorkingHoursCheck = useCallback(async (time: string, duration: number) => {
    try {
      const response = await fetch(`/api/groomer/working-hours-check?time=${time}&duration=${duration}`);
      if (response.ok) {
        const data = await response.json();
        setWorkingHoursCheck(data);
        setWorkingHoursWarningDismissed(false); // Reset dismissal when time changes
      }
    } catch (error) {
      console.error("Failed to fetch working hours check:", error);
    }
  }, []);

  // Get the first groomer for the account (used for area day suggestions)
  const fetchDefaultGroomer = useCallback(async () => {
    try {
      const response = await fetch("/api/groomers");
      if (response.ok) {
        const data = await response.json();
        if (data.groomers && data.groomers.length > 0) {
          setGroomerId(data.groomers[0].id);
          return data.groomers[0].id;
        }
      }
    } catch (error) {
      console.error("Failed to fetch groomers:", error);
    }
    return null;
  }, []);

  const selectCustomer = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer);
    setAppointmentData((prev) => ({ ...prev, customerId: customer.id }));
    setCurrentStep("pet");

    // Fetch area day suggestion
    let currentGroomerId = groomerId;
    if (!currentGroomerId) {
      currentGroomerId = await fetchDefaultGroomer();
    }
    if (currentGroomerId) {
      fetchAreaSuggestion(customer.id, currentGroomerId);
    }
  }, [groomerId, fetchDefaultGroomer, fetchAreaSuggestion]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Pre-select customer if provided
  useEffect(() => {
    if (preSelectedCustomerId && customers.length > 0) {
      const customer = customers.find((c) => c.id === preSelectedCustomerId);
      if (customer) {
        selectCustomer(customer);
      }
    }
  }, [preSelectedCustomerId, customers, selectCustomer]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Fetch large dog count when date changes and pet is a large dog
  useEffect(() => {
    if (appointmentData.date && selectedPet?.weight && selectedPet.weight > LARGE_DOG_WEIGHT_THRESHOLD) {
      fetchLargeDogCheck(appointmentData.date);
    } else {
      setLargeDogCheck(null);
    }
  }, [appointmentData.date, selectedPet, fetchLargeDogCheck]);

  // Fetch working hours check when time changes
  useEffect(() => {
    if (appointmentData.time) {
      fetchWorkingHoursCheck(appointmentData.time, appointmentData.serviceMinutes);
    } else {
      setWorkingHoursCheck(null);
    }
  }, [appointmentData.time, appointmentData.serviceMinutes, fetchWorkingHoursCheck]);

  // Helper to check if current booking would exceed limit
  const wouldExceedLargeDogLimit = () => {
    if (!largeDogCheck?.hasLimit || !selectedPet?.weight) return false;
    if (selectedPet.weight <= LARGE_DOG_WEIGHT_THRESHOLD) return false;
    // Would adding this large dog exceed the limit?
    return largeDogCheck.largeDogCount >= (largeDogCheck.limit || 0);
  };

  const selectPet = (pet: Pet) => {
    setSelectedPet(pet);
    setAppointmentData({ ...appointmentData, petId: pet.id });
    // Auto-set duration based on pet weight
    if (pet.weight) {
      if (pet.weight < 30) {
        setAppointmentData({ ...appointmentData, petId: pet.id, serviceMinutes: 60, price: 65 });
      } else if (pet.weight < 60) {
        setAppointmentData({ ...appointmentData, petId: pet.id, serviceMinutes: 90, price: 85 });
      } else {
        setAppointmentData({ ...appointmentData, petId: pet.id, serviceMinutes: 120, price: 105 });
      }
    }
    setCurrentStep("datetime");
  };

  const serviceTypes = [
    { value: "FULL_GROOM", label: "Full Groom", emoji: "💇", minutes: 90, price: 85 },
    { value: "BATH_ONLY", label: "Bath Only", emoji: "🛁", minutes: 60, price: 65 },
    { value: "NAIL_TRIM", label: "Nail Trim", emoji: "✂️", minutes: 15, price: 25 },
    { value: "FACE_FEET_FANNY", label: "Face/Feet/Fanny", emoji: "🐾", minutes: 45, price: 55 },
  ];

  const handleSubmit = async () => {
    if (!appointmentData.customerId || !appointmentData.date || !appointmentData.time) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create appointment");
      }

      const data = await response.json();
      toast.success("All set! Appointment scheduled");
      router.push("/dashboard/appointments");
    } catch (error) {
      console.error("Create appointment error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create appointment");
      setIsLoading(false);
    }
  };

  const steps = [
    { id: "customer", label: "Customer", active: currentStep === "customer" },
    { id: "pet", label: "Pet", active: currentStep === "pet" },
    { id: "datetime", label: "Time", active: currentStep === "datetime" },
    { id: "details", label: "Details", active: currentStep === "details" },
  ];

  // Get today's date as minimum (allow same-day appointments)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Check if selected date matches suggested area days
  const getSelectedDateMatch = () => {
    if (!appointmentData.date || !areaSuggestion?.suggestedDays?.length) {
      return null;
    }
    const selectedDate = new Date(appointmentData.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const isMatch = areaSuggestion.suggestedDays.includes(dayOfWeek);
    return {
      isMatch,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek],
    };
  };

  const dateMatch = getSelectedDateMatch();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">New Appointment</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center" style={{ flex: index === steps.length - 1 ? '0 0 auto' : '1 1 0%' }}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.active
                        ? "bg-[#A5744A] text-white"
                        : steps.findIndex((s) => s.id === currentStep) > index
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {steps.findIndex((s) => s.id === currentStep) > index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 text-gray-600 whitespace-nowrap">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      steps.findIndex((s) => s.id === currentStep) > index
                        ? "bg-green-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Step 1: Select Customer */}
        {currentStep === "customer" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full h-12 pl-10"
                  placeholder="Search customers..."
                />
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/customers/new")}
              className="w-full btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Add New Customer
            </button>

            <div className="space-y-3">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#A5744A]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.address}</p>
                      {customer.phone && (
                        <p className="text-sm text-gray-500">{customer.phone}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {customer.pets.length} {customer.pets.length === 1 ? "pet" : "pets"}
                      </p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Pet */}
        {currentStep === "pet" && selectedCustomer && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Selected Customer</p>
              <p className="text-blue-700">{selectedCustomer.name}</p>
            </div>

            {selectedCustomer.pets.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Who are we grooming today?</h2>
                <div className="space-y-3">
                  {selectedCustomer.pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => selectPet(pet)}
                      className="w-full bg-white rounded-xl shadow-sm p-4 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#A5744A]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{pet.species === "cat" ? "🐈" : "🐕"}</span>
                            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          </div>
                          {pet.breed && (
                            <p className="text-sm text-gray-600">{pet.breed}</p>
                          )}
                          {pet.weight && (
                            <p className="text-sm text-gray-500">{pet.weight} lbs</p>
                          )}
                          {pet.behaviorFlags && pet.behaviorFlags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {pet.behaviorFlags.map((flag) => (
                                <span
                                  key={flag}
                                  className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded"
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🐾</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No furry friends yet</h3>
                <p className="text-gray-600 mb-4">Let&apos;s add {selectedCustomer.name}&apos;s pet to get started</p>
                <button
                  onClick={() => router.push(`/dashboard/customers/${selectedCustomer.id}/pets/new`)}
                  className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
                >
                  <Plus className="h-5 w-5" />
                  Add Pet
                </button>
              </div>
            )}

            <button
              onClick={() => setCurrentStep("customer")}
              className="w-full btn btn-ghost"
            >
              Back to Customers
            </button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === "datetime" && (
          <div className="space-y-6">
            {/* Area Day Suggestion */}
            {areaSuggestion?.customer?.serviceAreaName && areaSuggestion.suggestedDays.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                    style={{ backgroundColor: areaSuggestion.customer.serviceAreaColor || '#22C55E' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {areaSuggestion.customer.serviceAreaName} Customer
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      <span className="font-medium">Best days to book:</span> {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(", ")}
                    </p>
                    <div className="mt-2 p-2 bg-emerald-100/50 rounded-lg">
                      <p className="text-xs text-emerald-800">
                        <span className="font-semibold">Why these days?</span> You work in {areaSuggestion.customer.serviceAreaName} on {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(" and ")}.
                        Booking on these days means shorter routes, less driving between appointments, and more time for grooming.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onClick={() => dateInputRef.current?.showPicker?.()}
                  >
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                      min={todayStr}
                      className="input input-bordered w-full h-12 text-base cursor-pointer opacity-0 absolute inset-0"
                      required
                    />
                    <div className="input input-bordered w-full h-12 text-base cursor-pointer flex items-center">
                      {appointmentData.date ? format(new Date(appointmentData.date + 'T00:00:00'), "EEEE, MMMM dd, yyyy") : "Select a date"}
                    </div>
                  </div>
                </div>

                {/* Date match feedback */}
                {dateMatch && areaSuggestion?.customer?.serviceAreaName && (
                  <div className={`mt-2 p-3 rounded-lg text-sm ${
                    dateMatch.isMatch
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {dateMatch.isMatch ? (
                      <div>
                        <span className="flex items-center gap-1 font-medium">
                          <Check className="h-4 w-4" />
                          Great choice!
                        </span>
                        <p className="text-xs mt-1 text-green-600">
                          {dateMatch.dayName} is your {areaSuggestion.customer.serviceAreaName} day. This keeps your route tight and efficient.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="flex items-center gap-1 font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          Heads up - {dateMatch.dayName} is not your {areaSuggestion.customer.serviceAreaName} day
                        </span>
                        <p className="text-xs mt-1 text-amber-700">
                          This customer is in {areaSuggestion.customer.serviceAreaName}, but you typically work elsewhere on {dateMatch.dayName}s.
                          This may add extra driving time between appointments. Consider booking on {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(" or ")} instead.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Large dog limit warning */}
                {wouldExceedLargeDogLimit() && !largeDogWarningDismissed && largeDogCheck && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium block">
                          Large Dog Limit Warning
                        </span>
                        <p className="text-xs mt-1 text-red-700">
                          {selectedPet?.name} is {selectedPet?.weight} lbs, which counts as a large dog.
                          You already have {largeDogCheck.largeDogCount} large dog{largeDogCheck.largeDogCount !== 1 ? 's' : ''} scheduled on this date,
                          and your daily limit is {largeDogCheck.limit}.
                        </p>
                        <p className="text-xs mt-2 text-red-600 font-medium">
                          Booking this appointment would exceed your limit. Consider choosing a different date to protect your energy.
                        </p>
                        <button
                          type="button"
                          onClick={() => setLargeDogWarningDismissed(true)}
                          className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                        >
                          I understand, continue anyway
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show large dog count info even if not exceeding limit (for awareness) */}
                {largeDogCheck?.hasLimit && selectedPet?.weight && selectedPet.weight > LARGE_DOG_WEIGHT_THRESHOLD && !wouldExceedLargeDogLimit() && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
                    <p className="text-xs">
                      <span className="font-medium">Large dog count:</span> {largeDogCheck.largeDogCount} of {largeDogCheck.limit} on this date
                      {largeDogCheck.remainingSlots !== null && largeDogCheck.remainingSlots > 0 && (
                        <span> ({largeDogCheck.remainingSlots - 1} slot{largeDogCheck.remainingSlots - 1 !== 1 ? 's' : ''} remaining after this booking)</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div
                    className="cursor-pointer"
                    onClick={() => timeInputRef.current?.showPicker?.()}
                  >
                    <input
                      ref={timeInputRef}
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                      className="input input-bordered w-full h-12 text-base cursor-pointer opacity-0 absolute inset-0"
                      required
                    />
                    <div className="input input-bordered w-full h-12 text-base cursor-pointer flex items-center">
                      {appointmentData.time ? (() => {
                        const [hours, minutes] = appointmentData.time.split(':');
                        const hour = parseInt(hours);
                        const period = hour >= 12 ? 'PM' : 'AM';
                        const hour12 = hour % 12 || 12;
                        return `${hour12}:${minutes} ${period}`;
                      })() : "Select a time"}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select your preferred arrival time
                </p>

                {/* Working hours warning */}
                {workingHoursCheck && !workingHoursCheck.isWithinWorkingHours && !workingHoursWarningDismissed && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium block">
                          Outside Working Hours
                        </span>
                        <p className="text-xs mt-1 text-amber-700">
                          {workingHoursCheck.startsBeforeWorkday && (
                            <>This appointment starts at {(() => {
                              const [hours, minutes] = appointmentData.time.split(':');
                              const hour = parseInt(hours);
                              const period = hour >= 12 ? 'PM' : 'AM';
                              const hour12 = hour % 12 || 12;
                              return `${hour12}:${minutes} ${period}`;
                            })()}, which is before your workday starts at {workingHoursCheck.workingHours.startFormatted}.</>
                          )}
                          {workingHoursCheck.startsAfterWorkday && (
                            <>This appointment starts at {(() => {
                              const [hours, minutes] = appointmentData.time.split(':');
                              const hour = parseInt(hours);
                              const period = hour >= 12 ? 'PM' : 'AM';
                              const hour12 = hour % 12 || 12;
                              return `${hour12}:${minutes} ${period}`;
                            })()}, which is after your workday ends at {workingHoursCheck.workingHours.endFormatted}.</>
                          )}
                          {workingHoursCheck.endsAfterWorkday && !workingHoursCheck.startsAfterWorkday && (
                            <>This {appointmentData.serviceMinutes}-minute appointment would end after your workday ends at {workingHoursCheck.workingHours.endFormatted}.</>
                          )}
                        </p>
                        <p className="text-xs mt-2 text-amber-600">
                          Your working hours are {workingHoursCheck.workingHours.startFormatted} - {workingHoursCheck.workingHours.endFormatted}. You can change this in Settings → Profile.
                        </p>
                        <button
                          type="button"
                          onClick={() => setWorkingHoursWarningDismissed(true)}
                          className="mt-2 text-xs text-amber-600 underline hover:text-amber-800"
                        >
                          I understand, continue anyway
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show working hours info when within hours */}
                {workingHoursCheck && workingHoursCheck.isWithinWorkingHours && appointmentData.time && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <p className="text-xs">
                        <span className="font-medium">Within working hours</span> ({workingHoursCheck.workingHours.startFormatted} - {workingHoursCheck.workingHours.endFormatted})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep("pet")}
                className="btn flex-1 h-12"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep("details")}
                disabled={!appointmentData.date || !appointmentData.time}
                className="btn flex-1 h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Service Details */}
        {currentStep === "details" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {serviceTypes.map((service) => (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() =>
                        setAppointmentData({
                          ...appointmentData,
                          serviceType: service.value,
                          serviceMinutes: service.minutes,
                          price: service.price,
                        })
                      }
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        appointmentData.serviceType === service.value
                          ? "border-[#A5744A] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-3xl mb-1">{service.emoji}</div>
                      <div className="text-sm font-medium">{service.label}</div>
                      <div className="text-xs text-gray-500">{service.minutes} min</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={appointmentData.serviceMinutes}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, serviceMinutes: parseInt(e.target.value) })
                    }
                    className="range range-sm flex-1"
                    style={{
                      background: `linear-gradient(to right, #A5744A 0%, #A5744A ${((appointmentData.serviceMinutes - 15) / (240 - 15)) * 100}%, #e5e7eb ${((appointmentData.serviceMinutes - 15) / (240 - 15)) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="input input-bordered w-32 h-10 text-base text-center flex items-center justify-center">
                    {appointmentData.serviceMinutes} minutes
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="5"
                    value={appointmentData.price}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, price: parseFloat(e.target.value) })
                    }
                    className="range range-sm flex-1"
                    style={{
                      background: `linear-gradient(to right, #A5744A 0%, #A5744A ${(appointmentData.price / 300) * 100}%, #e5e7eb ${(appointmentData.price / 300) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="input input-bordered w-32 h-10 text-base text-center flex items-center justify-center">
                    ${appointmentData.price}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, notes: e.target.value })
                  }
                  className="textarea textarea-bordered w-full text-base"
                  rows={3}
                  placeholder="Special requests or notes..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentStep("datetime")}
                className="btn flex-1 h-12"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn flex-1 h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
              >
                {isLoading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">Schedule Appointment</span>
                    <span className="sm:hidden">Schedule</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <NewAppointmentContent />
    </Suspense>
  );
}
