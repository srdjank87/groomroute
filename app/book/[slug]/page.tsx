"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, ArrowRight, Loader2, AlertCircle, Scissors } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

interface GroomerInfo {
  id: string;
  name: string;
  workingHoursStart: string;
  workingHoursEnd: string;
}

interface GeocodedLocation {
  lat: number;
  lng: number;
  zipCode?: string;
  city?: string;
  state?: string;
}

export default function BookingAddressPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [groomer, setGroomer] = useState<GroomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [address, setAddress] = useState("");
  const [geocodedLocation, setGeocodedLocation] = useState<GeocodedLocation | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroomer() {
      try {
        const response = await fetch(`/api/book/groomer/${slug}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Groomer not found");
        }
        const data = await response.json();
        setGroomer(data.groomer);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking page");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchGroomer();
    }
  }, [slug]);

  // Extract address components from Google Places result
  function extractAddressComponents(place: google.maps.places.PlaceResult): Partial<GeocodedLocation> {
    const components: Partial<GeocodedLocation> = {};

    for (const component of place.address_components || []) {
      const types = component.types || [];
      if (types.includes("postal_code")) {
        components.zipCode = component.long_name;
      }
      if (types.includes("locality")) {
        components.city = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        components.state = component.short_name;
      }
    }

    return components;
  }

  async function handleCheckAddress() {
    if (!address.trim()) {
      setAddressError("Please enter your address");
      return;
    }

    setIsChecking(true);
    setAddressError(null);

    try {
      // If we have pre-geocoded coordinates from autocomplete, include them
      const requestBody: Record<string, unknown> = {
        address: address.trim(),
        groomerSlug: slug,
      };

      if (geocodedLocation) {
        requestBody.lat = geocodedLocation.lat;
        requestBody.lng = geocodedLocation.lng;
        requestBody.zipCode = geocodedLocation.zipCode;
        requestBody.city = geocodedLocation.city;
        requestBody.state = geocodedLocation.state;
      }

      const response = await fetch("/api/book/check-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check address");
      }

      if (!data.geocoded) {
        setAddressError(data.message || "Could not verify this address. Please check and try again.");
        return;
      }

      if (!data.inServiceArea) {
        setAddressError(data.message || "This address is outside the service area.");
        return;
      }

      // Store booking data in sessionStorage and navigate to schedule page
      const bookingData = {
        address: data.formattedAddress || address,
        lat: data.lat,
        lng: data.lng,
        zipCode: data.zipCode,
        city: data.city,
        state: data.state,
        areaId: data.areaId,
        areaName: data.areaName,
        recommendedDays: data.recommendedDays || [],
      };

      sessionStorage.setItem(`booking_${slug}`, JSON.stringify(bookingData));
      router.push(`/book/${slug}/schedule`);
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Failed to check address");
    } finally {
      setIsChecking(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !groomer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Booking Unavailable
          </h1>
          <p className="text-gray-600">
            {error || "This booking page is not available."}
          </p>
        </div>
      </div>
    );
  }

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
              1
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              3
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <MapPin className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Where are you located?
            </h2>
            <p className="text-gray-600">
              Enter your address so we can check availability in your area
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <AddressAutocomplete
                  value={address}
                  onChange={(newAddress) => {
                    setAddress(newAddress);
                    setAddressError(null);
                    setGeocodedLocation(null); // Reset when typing manually
                  }}
                  onPlaceSelected={(place) => {
                    if (place.geometry?.location && place.formatted_address) {
                      const lat = place.geometry.location.lat();
                      const lng = place.geometry.location.lng();
                      const components = extractAddressComponents(place);

                      setAddress(place.formatted_address);
                      setGeocodedLocation({
                        lat,
                        lng,
                        ...components,
                      });
                      setAddressError(null);
                    }
                  }}
                  placeholder="Start typing your address..."
                  className={`input input-bordered w-full pl-10 ${
                    addressError ? "input-error" : ""
                  }`}
                />
              </div>
              {addressError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {addressError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select an address from the dropdown for best results
              </p>
            </div>

            <button
              onClick={handleCheckAddress}
              disabled={isChecking || !address.trim()}
              className="btn w-full bg-amber-600 hover:bg-amber-700 text-white border-none gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          We come to you! Your address helps us find the best available times.
        </p>
      </div>
    </div>
  );
}
