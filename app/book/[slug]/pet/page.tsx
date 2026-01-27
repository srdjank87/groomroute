"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PawPrint,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Scissors,
  Dog,
  Cat,
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
}

interface GroomerInfo {
  id: string;
  name: string;
}

type Species = "dog" | "cat";

const COMMON_DOG_BREEDS = [
  "Mixed Breed",
  "Labrador Retriever",
  "Golden Retriever",
  "Goldendoodle",
  "Labradoodle",
  "Poodle",
  "German Shepherd",
  "French Bulldog",
  "Bulldog",
  "Beagle",
  "Rottweiler",
  "Yorkshire Terrier",
  "Boxer",
  "Dachshund",
  "Shih Tzu",
  "Siberian Husky",
  "Great Dane",
  "Doberman Pinscher",
  "Australian Shepherd",
  "Cavalier King Charles Spaniel",
  "Miniature Schnauzer",
  "Pomeranian",
  "Boston Terrier",
  "Havanese",
  "Shetland Sheepdog",
  "Bernese Mountain Dog",
  "Brittany",
  "English Springer Spaniel",
  "Cocker Spaniel",
  "Maltese",
  "Chihuahua",
  "Pug",
  "Border Collie",
  "Bichon Frise",
  "Shiba Inu",
  "Akita",
  "Samoyed",
  "Chow Chow",
  "Other",
];

const COMMON_CAT_BREEDS = [
  "Domestic Shorthair",
  "Domestic Longhair",
  "Domestic Medium Hair",
  "Persian",
  "Maine Coon",
  "Ragdoll",
  "British Shorthair",
  "Siamese",
  "Bengal",
  "Abyssinian",
  "Sphynx",
  "Russian Blue",
  "Scottish Fold",
  "Himalayan",
  "Norwegian Forest Cat",
  "Siberian",
  "Birman",
  "Oriental Shorthair",
  "Devon Rex",
  "Cornish Rex",
  "Other",
];

const SIZE_OPTIONS = [
  { value: "small", label: "Small", description: "Under 20 lbs", weightRange: "0-20" },
  { value: "medium", label: "Medium", description: "20-50 lbs", weightRange: "20-50" },
  { value: "large", label: "Large", description: "50-80 lbs", weightRange: "50-80" },
  { value: "giant", label: "Giant", description: "Over 80 lbs", weightRange: "80+" },
];

const CAT_SIZE_OPTIONS = [
  { value: "small", label: "Small", description: "Under 8 lbs", weightRange: "0-8" },
  { value: "medium", label: "Medium", description: "8-12 lbs", weightRange: "8-12" },
  { value: "large", label: "Large", description: "Over 12 lbs", weightRange: "12+" },
];

export default function BookingPetPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [groomer, setGroomer] = useState<GroomerInfo | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pet form state
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [size, setSize] = useState("");
  const [petName, setPetName] = useState("");

  useEffect(() => {
    async function init() {
      const stored = sessionStorage.getItem(`booking_${slug}`);
      if (!stored) {
        router.push(`/book/${slug}`);
        return;
      }

      const data = JSON.parse(stored) as BookingData;
      setBookingData(data);

      // Restore pet data if going back
      if ((data as BookingData & { petSpecies?: Species }).petSpecies) {
        const extendedData = data as BookingData & {
          petSpecies: Species;
          petBreed: string;
          petSize: string;
          petName: string;
        };
        setSpecies(extendedData.petSpecies);
        setBreed(extendedData.petBreed || "");
        setSize(extendedData.petSize || "");
        setPetName(extendedData.petName || "");
      }

      try {
        const response = await fetch(`/api/book/groomer/${slug}`);
        if (!response.ok) throw new Error("Groomer not found");
        const groomerData = await response.json();
        setGroomer(groomerData.groomer);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) init();
  }, [slug, router]);

  function handleContinue() {
    if (!breed || !size) return;

    const updatedData = {
      ...bookingData,
      petSpecies: species,
      petBreed: breed,
      petSize: size,
      petName: petName.trim() || undefined,
    };

    sessionStorage.setItem(`booking_${slug}`, JSON.stringify(updatedData));
    router.push(`/book/${slug}/schedule`);
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

  const breedOptions = species === "dog" ? COMMON_DOG_BREEDS : COMMON_CAT_BREEDS;
  const sizeOptions = species === "dog" ? SIZE_OPTIONS : CAT_SIZE_OPTIONS;

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
              2
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              4
            </div>
          </div>

          <button
            onClick={() => router.push(`/book/${slug}`)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <PawPrint className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about your pet
            </h2>
            <p className="text-gray-600">
              This helps us estimate appointment time
            </p>
          </div>

          <div className="space-y-5">
            {/* Species selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSpecies("dog");
                    setBreed("");
                    setSize("");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    species === "dog"
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Dog className={`h-8 w-8 ${species === "dog" ? "text-amber-600" : "text-gray-400"}`} />
                  <span className={`font-medium ${species === "dog" ? "text-amber-700" : "text-gray-600"}`}>
                    Dog
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSpecies("cat");
                    setBreed("");
                    setSize("");
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    species === "cat"
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Cat className={`h-8 w-8 ${species === "cat" ? "text-amber-600" : "text-gray-400"}`} />
                  <span className={`font-medium ${species === "cat" ? "text-amber-700" : "text-gray-600"}`}>
                    Cat
                  </span>
                </button>
              </div>
            </div>

            {/* Pet name (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet&apos;s Name <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder={species === "dog" ? "e.g., Max" : "e.g., Whiskers"}
                className="input input-bordered w-full"
              />
            </div>

            {/* Breed selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Select a breed...</option>
                {breedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {breed === "Other" && (
                <input
                  type="text"
                  placeholder="Enter breed..."
                  className="input input-bordered w-full mt-2"
                  onChange={(e) => setBreed(e.target.value || "Other")}
                />
              )}
            </div>

            {/* Size selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className={`grid gap-2 ${species === "dog" ? "grid-cols-2" : "grid-cols-3"}`}>
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSize(opt.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      size === opt.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`font-medium ${size === opt.value ? "text-amber-700" : "text-gray-700"}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={!breed || !size}
              className="btn w-full bg-amber-600 hover:bg-amber-700 text-white border-none gap-2 disabled:bg-gray-300 mt-4"
            >
              Continue
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          We use this to estimate how long your appointment will take.
        </p>
      </div>
    </div>
  );
}
