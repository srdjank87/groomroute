"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Scissors,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface BookingData {
  address: string;
  lat: number;
  lng: number;
  zipCode?: string;
  city?: string;
  state?: string;
  areaId: string | null;
  areaName: string | null;
  recommendedDays: Array<{ dayOfWeek: number; dayName: string }>;
  // Pet details
  petSpecies: "dog" | "cat";
  petBreed: string;
  petSize: "small" | "medium" | "large" | "giant";
  petName?: string;
}

interface TimeSlot {
  time: string;
  timeFormatted: string;
  available: boolean;
}

interface GroomerInfo {
  id: string;
  name: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Client-side duration estimation based on pet characteristics
// Matches server-side logic in lib/booking-duration.ts
function estimateDurationMinutes(pet: {
  species: "dog" | "cat";
  breed: string;
  size: "small" | "medium" | "large" | "giant";
}): number {
  const DURATION_MAP = {
    LIGHT: 45,
    MODERATE: 60,
    DEMANDING: 90,
    INTENSIVE: 120,
  };

  // Breed patterns that indicate more demanding grooms
  const INTENSIVE_BREEDS = /malamute|newfoundland|saint\s*bernard|great\s*pyrenees|bernese|tibetan\s*mastiff/i;
  const DEMANDING_BREEDS = /doodle|poo($|\s)|oodle|poodle|bichon|husky|samoyed|chow|akita|collie|sheltie|golden\s*retriever|cocker\s*spaniel|shih\s*tzu|maltese|yorkie|yorkshire|havanese|persian|maine\s*coon|ragdoll|himalayan|norwegian\s*forest|siberian/i;
  const LIGHT_BREEDS = /chihuahua|greyhound|basenji|hairless|chinese\s*crested|siamese|domestic\s*short|bengal|abyssinian|sphynx/i;

  let intensity: keyof typeof DURATION_MAP = "MODERATE";

  // Check breed first
  if (INTENSIVE_BREEDS.test(pet.breed)) {
    intensity = "INTENSIVE";
  } else if (DEMANDING_BREEDS.test(pet.breed)) {
    intensity = "DEMANDING";
  } else if (LIGHT_BREEDS.test(pet.breed)) {
    intensity = "LIGHT";
  }

  // Adjust for size (larger = more time)
  if (pet.species === "dog") {
    if (pet.size === "giant" && intensity !== "INTENSIVE") {
      intensity = intensity === "LIGHT" ? "MODERATE" : intensity === "MODERATE" ? "DEMANDING" : "INTENSIVE";
    } else if (pet.size === "large" && intensity === "LIGHT") {
      intensity = "MODERATE";
    } else if (pet.size === "small" && intensity === "MODERATE") {
      intensity = "LIGHT";
    }
  }

  return DURATION_MAP[intensity];
}

export default function BookingSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [groomer, setGroomer] = useState<GroomerInfo | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Time slots state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);

  useEffect(() => {
    async function init() {
      // Get booking data from session storage
      const stored = sessionStorage.getItem(`booking_${slug}`);
      if (!stored) {
        router.push(`/book/${slug}`);
        return;
      }

      const data = JSON.parse(stored) as BookingData;

      // Redirect to pet page if pet details are missing
      if (!data.petSpecies || !data.petBreed || !data.petSize) {
        router.push(`/book/${slug}/pet`);
        return;
      }

      setBookingData(data);

      // Calculate estimated duration from pet details
      const duration = estimateDurationMinutes({
        species: data.petSpecies,
        breed: data.petBreed,
        size: data.petSize,
      });
      setEstimatedDuration(duration);

      // Fetch groomer info
      try {
        const response = await fetch(`/api/book/groomer/${slug}`);
        if (!response.ok) {
          throw new Error("Groomer not found");
        }
        const data = await response.json();
        setGroomer(data.groomer);
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

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return;

      setIsLoadingSlots(true);
      setSelectedTime(null);

      try {
        const response = await fetch(
          `/api/book/available-slots?groomerSlug=${slug}&date=${selectedDate}&duration=${estimatedDuration}`
        );
        const data = await response.json();

        if (response.ok) {
          setSlots(data.slots || []);
        } else {
          setSlots([]);
        }
      } catch {
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDate, slug, estimatedDuration]);

  function generateCalendarDays() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{
      date: string;
      day: number;
      isToday: boolean;
      isPast: boolean;
      isRecommended: boolean;
    }> = [];

    // Add empty slots for padding
    for (let i = 0; i < startPadding; i++) {
      days.push({
        date: "",
        day: 0,
        isToday: false,
        isPast: true,
        isRecommended: false,
      });
    }

    // Add actual days
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();

      const isRecommended = bookingData?.recommendedDays.some(
        (rd) => rd.dayOfWeek === dayOfWeek
      ) || false;

      days.push({
        date: dateStr,
        day: d,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isRecommended,
      });
    }

    return days;
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime) return;

    const updatedData = {
      ...bookingData,
      selectedDate,
      selectedTime,
    };

    sessionStorage.setItem(`booking_${slug}`, JSON.stringify(updatedData));
    router.push(`/book/${slug}/details`);
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
          <p className="text-gray-600 mb-4">
            {error || "Please start over"}
          </p>
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

  const calendarDays = generateCalendarDays();

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
            <div className="w-12 h-1 bg-gray-200 rounded" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              4
            </div>
          </div>

          <button
            onClick={() => router.push(`/book/${slug}/pet`)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pick a date & time
            </h2>
            <p className="text-gray-600">
              Select when you would like your appointment
            </p>
          </div>

          {/* Recommended days hint */}
          {bookingData.recommendedDays.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg mb-4 text-sm">
              <Star className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800">
                <span className="font-medium">Best days for your area:</span>{" "}
                {bookingData.recommendedDays.map((d) => d.dayName).join(", ")}
              </span>
            </div>
          )}

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="font-semibold text-gray-900">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  disabled={!day.date || day.isPast}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    aspect-square rounded-lg text-sm font-medium transition-all relative
                    ${!day.date ? "invisible" : ""}
                    ${day.isPast ? "text-gray-300 cursor-not-allowed" : ""}
                    ${
                      selectedDate === day.date
                        ? "bg-amber-600 text-white"
                        : day.isToday
                        ? "bg-amber-100 text-amber-800"
                        : day.isRecommended && !day.isPast
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "hover:bg-gray-100 text-gray-700"
                    }
                  `}
                >
                  {day.day || ""}
                  {day.isRecommended && !day.isPast && selectedDate !== day.date && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Available times
              </h3>

              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No available times on this day. Try another date.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`
                        py-3 px-4 rounded-lg text-sm font-medium transition-all
                        ${
                          selectedTime === slot.time
                            ? "bg-amber-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}
                    >
                      {slot.timeFormatted}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Continue button */}
          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
              className="btn w-full bg-amber-600 hover:bg-amber-700 text-white border-none gap-2 disabled:bg-gray-300"
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
