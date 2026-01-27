"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Scissors,
  Dog,
  Cat,
  Mail,
  Phone,
} from "lucide-react";

interface BookingData {
  address: string;
  lat: number;
  lng: number;
  zipCode: string;
  city: string;
  state: string;
  areaId: string | null;
  selectedDate: string;
  selectedTime: string;
}

interface GroomerInfo {
  id: string;
  name: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [groomer, setGroomer] = useState<GroomerInfo | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [petName, setPetName] = useState("");
  const [petSpecies, setPetSpecies] = useState<"dog" | "cat">("dog");
  const [petBreed, setPetBreed] = useState("");
  const [petWeight, setPetWeight] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function init() {
      const stored = sessionStorage.getItem(`booking_${slug}`);
      if (!stored) {
        router.push(`/book/${slug}`);
        return;
      }

      const data = JSON.parse(stored);
      if (!data.selectedDate || !data.selectedTime) {
        router.push(`/book/${slug}/schedule`);
        return;
      }

      setBookingData(data);

      try {
        const response = await fetch(`/api/book/groomer/${slug}`);
        if (!response.ok) {
          throw new Error("Groomer not found");
        }
        const resData = await response.json();
        setGroomer(resData.groomer);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      init();
    }
  }, [slug, router]);

  async function handleSubmit() {
    // Validate required fields
    if (!clientName.trim()) {
      setSubmitError("Please enter your name");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setSubmitError("Please enter a valid email");
      return;
    }
    if (!clientPhone.trim()) {
      setSubmitError("Please enter your phone number");
      return;
    }
    if (!petName.trim()) {
      setSubmitError("Please enter your pet's name");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/book/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomerSlug: slug,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          address: bookingData?.address,
          lat: bookingData?.lat,
          lng: bookingData?.lng,
          zipCode: bookingData?.zipCode,
          city: bookingData?.city,
          state: bookingData?.state,
          areaId: bookingData?.areaId,
          date: bookingData?.selectedDate,
          time: bookingData?.selectedTime,
          petName: petName.trim(),
          petSpecies,
          petBreed: petBreed.trim() || null,
          petWeight: petWeight ? parseFloat(petWeight) : null,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Store confirmation data and navigate to success page
      sessionStorage.setItem(
        `booking_confirmation_${slug}`,
        JSON.stringify({
          appointmentId: data.appointmentId,
          groomerName: groomer?.name,
          date: bookingData?.selectedDate,
          time: bookingData?.selectedTime,
          clientName: clientName.trim(),
          petName: petName.trim(),
        })
      );

      // Clear booking data
      sessionStorage.removeItem(`booking_${slug}`);

      router.push(`/book/${slug}/success`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !groomer || !bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-4">{error || "Please start over"}</p>
          <button
            onClick={() => router.push(`/book/${slug}`)}
            className="btn bg-amber-600 hover:bg-amber-700 text-white border-none"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  // Format the selected date for display
  const dateObj = new Date(bookingData.selectedDate + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Format time for display
  const [hours, minutes] = bookingData.selectedTime.split(":");
  const hour = parseInt(hours);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const formattedTime = `${displayHour}:${minutes} ${period}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <Scissors className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {groomer.name}
              </h1>
              <p className="text-sm text-gray-500">Mobile Pet Grooming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-medium">
              <span className="text-xs">&#10003;</span>
            </div>
            <div className="w-12 h-1 bg-amber-600 rounded" />
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-medium">
              <span className="text-xs">&#10003;</span>
            </div>
            <div className="w-12 h-1 bg-amber-600 rounded" />
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
          </div>

          <button
            onClick={() => router.push(`/book/${slug}/schedule`)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Appointment summary */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <span className="font-medium">{formattedDate}</span> at{" "}
              <span className="font-medium">{formattedTime}</span>
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {bookingData.address}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your details
            </h2>
            <p className="text-gray-600">
              Tell us about you and your pet
            </p>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Contact Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="John Smith"
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="input input-bordered w-full pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pet Information */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Pet Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Pet Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPetSpecies("dog")}
                      className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        petSpecies === "dog"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Dog className="h-5 w-5" />
                      Dog
                    </button>
                    <button
                      type="button"
                      onClick={() => setPetSpecies("cat")}
                      className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                        petSpecies === "cat"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <Cat className="h-5 w-5" />
                      Cat
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Pet Name *
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder={petSpecies === "dog" ? "Buddy" : "Whiskers"}
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Breed
                    </label>
                    <input
                      type="text"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      placeholder={petSpecies === "dog" ? "Golden Retriever" : "Persian"}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      value={petWeight}
                      onChange={(e) => setPetWeight(e.target.value)}
                      placeholder="50"
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Special requests or notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, parking instructions, pet temperament, etc."
                rows={3}
                className="textarea textarea-bordered w-full"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn w-full bg-amber-600 hover:bg-amber-700 text-white border-none gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Complete Booking
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
