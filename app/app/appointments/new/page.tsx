"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Search, Plus, Check, Calendar as CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";

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

  const selectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setAppointmentData((prev) => ({ ...prev, customerId: customer.id }));
    setCurrentStep("pet");
  }, []);

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
      toast.success("Appointment booked successfully!");
      router.push("/app/appointments");
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

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

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
              onClick={() => router.push("/app/customers/new")}
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
                <h2 className="text-lg font-semibold text-gray-900">Select Pet</h2>
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
                <p className="text-gray-600 mb-4">No pets found for this customer</p>
                <button
                  onClick={() => router.push(`/app/customers/${selectedCustomer.id}/pets/new`)}
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
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <div
                  className="cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({ ...appointmentData, date: e.target.value })}
                    min={tomorrowStr}
                    className="input input-bordered w-full h-12 text-base cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time <span className="text-red-500">*</span>
                </label>
                <div
                  className="cursor-pointer"
                  onClick={() => timeInputRef.current?.showPicker?.()}
                >
                  <input
                    ref={timeInputRef}
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({ ...appointmentData, time: e.target.value })}
                    className="input input-bordered w-full h-12 text-base cursor-pointer"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select your preferred arrival time
                </p>
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
                  Price ($)
                </label>
                <input
                  type="number"
                  value={appointmentData.price}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, price: parseFloat(e.target.value) })
                  }
                  className="input input-bordered w-full h-12 text-base"
                  min="0"
                  step="5"
                />
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
                    Book Appointment
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
