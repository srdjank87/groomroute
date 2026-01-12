"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Plus, Check, Calendar as CalendarIcon, MapPin, AlertTriangle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { AppointmentCalendar } from "@/components/ui/appointment-calendar";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Step = "customer" | "pet" | "details" | "datetime";

interface ServiceArea {
  id: string;
  name: string;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  pets: Pet[];
  serviceArea?: ServiceArea | null;
  _count?: {
    appointments: number;
  };
  totalRevenue?: number;
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
  suggestedTime: {
    time: string;
    timeFormatted: string;
  } | null;
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

interface ConflictCheck {
  hasConflict: boolean;
  conflicts: Array<{
    id: string;
    customerName: string;
    petName: string;
    startTime: string;
    endTime: string;
  }>;
  proposedStart: string;
  proposedEnd: string;
  nextAvailable: {
    time: string;
    timeFormatted: string;
  } | null;
}

type AreaForDate = {
  areaId: string;
  areaName: string;
  areaColor: string;
  isOverride: boolean;
} | null;

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
  const [conflictCheck, setConflictCheck] = useState<ConflictCheck | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [calendarAreaData, setCalendarAreaData] = useState<Record<string, AreaForDate>>({});

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

  // Fetch conflict check for date and time
  const fetchConflictCheck = useCallback(async (date: string, time: string, duration: number) => {
    if (!date || !time) {
      setConflictCheck(null);
      return;
    }
    setIsCheckingConflict(true);
    try {
      const response = await fetch(
        `/api/appointments/check-conflict?date=${date}&time=${time}&duration=${duration}`
      );
      if (response.ok) {
        const data = await response.json();
        setConflictCheck(data);
      }
    } catch (error) {
      console.error("Failed to fetch conflict check:", error);
    } finally {
      setIsCheckingConflict(false);
    }
  }, []);

  // Get the groomer for the account (used for area day suggestions)
  const fetchDefaultGroomer = useCallback(async () => {
    try {
      const response = await fetch("/api/groomer/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.groomer?.id) {
          setGroomerId(data.groomer.id);
          return data.groomer.id;
        }
      }
    } catch (error) {
      console.error("Failed to fetch groomer:", error);
    }
    return null;
  }, []);

  // Scroll to top when changing steps
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const selectCustomer = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer);
    setAppointmentData((prev) => ({ ...prev, customerId: customer.id }));
    setCurrentStep("pet");
    scrollToTop();

    // Fetch area day suggestion
    let currentGroomerId = groomerId;
    if (!currentGroomerId) {
      currentGroomerId = await fetchDefaultGroomer();
    }
    if (currentGroomerId) {
      fetchAreaSuggestion(customer.id, currentGroomerId);
    }
  }, [groomerId, fetchDefaultGroomer, fetchAreaSuggestion, scrollToTop]);

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

  // Fetch conflict check when date, time, or duration changes
  useEffect(() => {
    if (appointmentData.date && appointmentData.time) {
      fetchConflictCheck(appointmentData.date, appointmentData.time, appointmentData.serviceMinutes);
    } else {
      setConflictCheck(null);
    }
  }, [appointmentData.date, appointmentData.time, appointmentData.serviceMinutes, fetchConflictCheck]);

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
    setCurrentStep("details"); // Go to details step now (before datetime)
    scrollToTop();
  };

  const [isCustomService, setIsCustomService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState("");

  const serviceTypes = [
    { value: "FULL_GROOM", label: "Full Groom", emoji: "🐕", description: "Complete grooming package", minutes: 90, price: 85 },
    { value: "BATH_BRUSH", label: "Bath & Brush", emoji: "🛁", description: "Bath, blow-dry & brush out", minutes: 60, price: 65 },
    { value: "DESHED", label: "De-shed Treatment", emoji: "🪮", description: "Deep undercoat removal", minutes: 75, price: 75 },
    { value: "PUPPY_INTRO", label: "Puppy Intro", emoji: "🐶", description: "First groom experience", minutes: 45, price: 55 },
    { value: "NAIL_TRIM", label: "Nail Trim", emoji: "✂️", description: "Quick nail maintenance", minutes: 15, price: 25 },
    { value: "FACE_FEET_FANNY", label: "Tidy Up", emoji: "🐾", description: "Face, feet & sanitary trim", minutes: 45, price: 55 },
    { value: "HAND_STRIP", label: "Hand Stripping", emoji: "🧤", description: "For wire-coated breeds", minutes: 120, price: 120 },
    { value: "CUSTOM", label: "Custom", emoji: "⭐", description: "Define your own service", minutes: 60, price: 65 },
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
    { id: "customer", label: "Client", active: currentStep === "customer" },
    { id: "pet", label: "Pet", active: currentStep === "pet" },
    { id: "details", label: "Details", active: currentStep === "details" },
    { id: "datetime", label: "Time", active: currentStep === "datetime" },
  ];

  // Get today's date as minimum (allow same-day appointments)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Check if selected date matches the customer's area (respects date overrides)
  const getSelectedDateMatch = () => {
    if (!appointmentData.date || !areaSuggestion?.customer?.serviceAreaId) {
      return null;
    }
    const selectedDate = new Date(appointmentData.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const dayName = DAY_NAMES[dayOfWeek];

    // Check the actual area for this specific date (from calendar data)
    const areaForDate = calendarAreaData[appointmentData.date];

    // Check if the assigned area for this date matches the customer's area
    const isMatch = areaForDate?.areaId === areaSuggestion.customer.serviceAreaId;

    return {
      isMatch,
      dayOfWeek,
      dayName,
      areaForDate,
      isOverride: areaForDate?.isOverride || false,
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
                  placeholder="Search clients..."
                />
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard/customers/new")}
              className="w-full btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Add New Client
            </button>

            <div className="space-y-3">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => selectCustomer(customer)}
                  className="w-full bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 text-left border-2 border-transparent hover:border-[#A5744A]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                        {customer.serviceArea && (
                          <span
                            className="badge badge-sm text-white"
                            style={{ backgroundColor: customer.serviceArea.color }}
                          >
                            {customer.serviceArea.name}
                          </span>
                        )}
                      </div>
                      {customer.phone && (
                        <p className="text-sm text-gray-600">{customer.phone}</p>
                      )}
                      <p className="text-sm text-gray-500">{customer.address}</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180 flex-shrink-0" />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        {customer.pets.length} {customer.pets.length === 1 ? "pet" : "pets"}
                      </span>
                      {customer._count?.appointments !== undefined && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {customer._count.appointments}
                        </span>
                      )}
                      {customer.totalRevenue !== undefined && customer.totalRevenue > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {customer.totalRevenue.toFixed(0)}
                        </span>
                      )}
                    </div>
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
              <p className="text-sm font-medium text-blue-900">Selected Client</p>
              <p className="text-blue-700">{selectedCustomer.name}</p>
            </div>

            {selectedCustomer.pets.length > 0 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Who are we grooming?</h2>
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
              onClick={() => {
                setCurrentStep("customer");
                scrollToTop();
              }}
              className="w-full btn btn-ghost"
            >
              Back to Clients
            </button>
          </div>
        )}

        {/* Step 4: Date & Time - Final step, now knows exact duration */}
        {currentStep === "datetime" && (
          <div className="space-y-6">
            {/* Service summary - shows what was selected in previous step */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Service Details</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg">
                  {serviceTypes.find(s => s.value === appointmentData.serviceType)?.emoji || "🐕"}
                </span>
                <div>
                  <p className="text-blue-700 font-medium">
                    {isCustomService && customServiceName
                      ? customServiceName
                      : serviceTypes.find(s => s.value === appointmentData.serviceType)?.label || "Full Groom"}
                  </p>
                  <p className="text-xs text-blue-600">
                    {appointmentData.serviceMinutes} minutes • ${appointmentData.price}
                  </p>
                </div>
              </div>
            </div>

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
                      {areaSuggestion.customer.serviceAreaName} Client
                    </p>
                    <p className="text-sm text-emerald-700 mt-1">
                      <span className="font-medium">Best days:</span> {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(", ")}
                    </p>

                    {/* Quick-apply suggested date and time button */}
                    {areaSuggestion.nextSuggestedDate && (
                      <div className="mt-3 space-y-2">
                        {areaSuggestion.suggestedTime ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAppointmentData({
                                ...appointmentData,
                                date: areaSuggestion.nextSuggestedDate!,
                                time: areaSuggestion.suggestedTime!.time,
                              });
                            }}
                            className="w-full btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            Use {format(new Date(areaSuggestion.nextSuggestedDate + 'T00:00:00'), "EEE, MMM d")} at {areaSuggestion.suggestedTime.timeFormatted}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAppointmentData({ ...appointmentData, date: areaSuggestion.nextSuggestedDate! });
                            }}
                            className="w-full btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                          >
                            <CalendarIcon className="h-4 w-4" />
                            Use {format(new Date(areaSuggestion.nextSuggestedDate + 'T00:00:00'), "EEEE, MMM d")}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-2 p-2 bg-emerald-100/50 rounded-lg">
                      <p className="text-xs text-emerald-800">
                        <span className="font-semibold">Why these days?</span> You work in {areaSuggestion.customer.serviceAreaName} on {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(" and ")}.
                        Booking on these days means shorter routes and less driving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Calendar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date <span className="text-red-500">*</span>
              </label>
              <AppointmentCalendar
                selectedDate={appointmentData.date ? new Date(appointmentData.date + 'T00:00:00') : null}
                onDateSelect={(date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  setAppointmentData({ ...appointmentData, date: dateStr });
                }}
                suggestedDays={areaSuggestion?.suggestedDays || []}
                customerAreaColor={areaSuggestion?.customer?.serviceAreaColor || undefined}
                minDate={today}
                onAreaDataChange={(areasByDate) => setCalendarAreaData(areasByDate)}
              />

              {/* Selected date display with feedback */}
              {appointmentData.date && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  dateMatch?.isMatch
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : dateMatch && areaSuggestion?.customer?.serviceAreaName
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-gray-50 text-gray-700 border border-gray-200"
                }`}>
                  <p className="font-medium">
                    {format(new Date(appointmentData.date + 'T00:00:00'), "EEEE, MMMM dd, yyyy")}
                  </p>
                  {dateMatch?.isMatch && areaSuggestion?.customer?.serviceAreaName && (
                    <p className="text-xs mt-1 text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {dateMatch.isOverride
                        ? `Great choice! This ${dateMatch.dayName} is scheduled for ${areaSuggestion.customer.serviceAreaName}.`
                        : `Great choice! ${dateMatch.dayName} is your ${areaSuggestion.customer.serviceAreaName} day.`
                      }
                    </p>
                  )}
                  {dateMatch && !dateMatch.isMatch && areaSuggestion?.customer?.serviceAreaName && (
                    <p className="text-xs mt-1 text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {dateMatch.areaForDate
                        ? `This ${dateMatch.dayName} is scheduled for ${dateMatch.areaForDate.areaName}, not ${areaSuggestion.customer.serviceAreaName}.`
                        : `${dateMatch.dayName} is not your ${areaSuggestion.customer.serviceAreaName} day.`
                      }
                      {areaSuggestion.suggestedDays.length > 0 && (
                        <> Consider {areaSuggestion.suggestedDays.map(d => DAY_NAMES[d]).join(" or ")}.</>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Large dog limit warning */}
              {wouldExceedLargeDogLimit() && !largeDogWarningDismissed && largeDogCheck && (
                <div className="mt-3 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
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
                <div className="mt-3 p-3 rounded-lg text-sm bg-blue-50 text-blue-800 border border-blue-200">
                  <p className="text-xs">
                    <span className="font-medium">Large dog count:</span> {largeDogCheck.largeDogCount} of {largeDogCheck.limit} on this date
                    {largeDogCheck.remainingSlots !== null && largeDogCheck.remainingSlots > 0 && (
                      <span> ({largeDogCheck.remainingSlots - 1} slot{largeDogCheck.remainingSlots - 1 !== 1 ? 's' : ''} remaining after this booking)</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Time Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
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

                {/* Conflict checking indicator */}
                {isCheckingConflict && appointmentData.date && appointmentData.time && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-gray-50 text-gray-600 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-xs"></span>
                      <p className="text-xs">Checking for scheduling conflicts...</p>
                    </div>
                  </div>
                )}

                {/* Conflict error - blocks booking */}
                {conflictCheck?.hasConflict && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-medium block">
                          Time Conflict Detected
                        </span>
                        <p className="text-xs mt-1 text-red-700">
                          Your {appointmentData.serviceMinutes}-minute appointment ({conflictCheck.proposedStart} - {conflictCheck.proposedEnd}) overlaps with:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {conflictCheck.conflicts.map((conflict) => (
                            <li key={conflict.id} className="text-xs text-red-700 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                              <span className="font-medium">{conflict.petName}</span> ({conflict.customerName}) - {conflict.startTime} to {conflict.endTime}
                            </li>
                          ))}
                        </ul>

                        {/* Suggest next available time */}
                        {conflictCheck.nextAvailable ? (
                          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-xs text-emerald-800 font-medium mb-2">
                              Next available slot: {conflictCheck.nextAvailable.timeFormatted}
                            </p>
                            <button
                              type="button"
                              onClick={() => setAppointmentData({ ...appointmentData, time: conflictCheck.nextAvailable!.time })}
                              className="w-full btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            >
                              <CalendarIcon className="h-4 w-4" />
                              Use {conflictCheck.nextAvailable.timeFormatted}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs mt-2 text-red-600 font-medium">
                            No available slots found on this date. Please try a different date.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* No conflict - success indicator */}
                {conflictCheck && !conflictCheck.hasConflict && appointmentData.date && appointmentData.time && !isCheckingConflict && (
                  <div className="mt-2 p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <p className="text-xs">
                        <span className="font-medium">Time slot available</span> ({conflictCheck.proposedStart} - {conflictCheck.proposedEnd})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentStep("details");
                  scrollToTop();
                }}
                className="btn flex-1 h-12"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!appointmentData.date || !appointmentData.time || conflictCheck?.hasConflict || isCheckingConflict || isLoading}
                className="btn flex-1 h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isCheckingConflict ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : isLoading ? (
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

        {/* Step 3: Service Details - Now comes before Time */}
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
                      onClick={() => {
                        setIsCustomService(service.value === "CUSTOM");
                        setAppointmentData({
                          ...appointmentData,
                          serviceType: service.value,
                          serviceMinutes: service.minutes,
                          price: service.price,
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        appointmentData.serviceType === service.value
                          ? "border-[#A5744A] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{service.emoji}</span>
                        <span className="text-sm font-medium">{service.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{service.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{service.minutes} min • ${service.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom service name input */}
              {isCustomService && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Service Name
                  </label>
                  <input
                    type="text"
                    value={customServiceName}
                    onChange={(e) => setCustomServiceName(e.target.value)}
                    className="input input-bordered w-full h-12 text-base"
                    placeholder="e.g., Breed-specific cut, Show prep..."
                  />
                </div>
              )}

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
                onClick={() => {
                  setCurrentStep("pet");
                  scrollToTop();
                }}
                className="btn flex-1 h-12"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setCurrentStep("datetime");
                  scrollToTop();
                }}
                className="btn flex-1 h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
              >
                Next
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
