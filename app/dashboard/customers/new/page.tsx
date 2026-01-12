"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, ChevronDown, ChevronUp, MapPin, Sparkles, Phone, Mail } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import MapPreview from "@/components/MapPreview";
import toast from "react-hot-toast";

interface AreaSuggestion {
  id: string;
  name: string;
  color: string;
  customerCount: number;
  confidence: "exact" | "prefix" | "nearby";
}

interface ServiceArea {
  id: string;
  name: string;
  color: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressNotes, setShowAddressNotes] = useState(false);
  const [showPetSection, setShowPetSection] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<{
    lat: number;
    lng: number;
    status: string;
  } | null>(null);

  // Area suggestion state
  const [areaSuggestion, setAreaSuggestion] = useState<AreaSuggestion | null>(null);
  const [areaSuggestionReason, setAreaSuggestionReason] = useState<string>("");
  const [allAreas, setAllAreas] = useState<ServiceArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showAreaSelector, setShowAreaSelector] = useState(false);

  const [formData, setFormData] = useState({
    // Customer info
    name: "",
    phone: "",
    email: "",
    // Address
    address: "",
    addressNotes: "",
    accessInstructions: "",
    // Pet (optional)
    petName: "",
    species: "dog",
    breed: "",
    weight: "",
    behaviorFlags: [] as string[],
    specialHandling: "",
    // Notes
    notes: "",
    serviceAreaId: null as string | null,
  });

  // Extract zip code from address string
  const extractZipCode = (address: string): string | null => {
    // Match US zip codes (5 digits or 5+4 format)
    const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
    return match ? match[1] : null;
  };

  // Fetch area suggestion when address changes
  const fetchAreaSuggestion = useCallback(async (zipCode: string) => {
    try {
      const response = await fetch(`/api/areas/suggest?zipCode=${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data.suggestion) {
          setAreaSuggestion(data.suggestion);
          setAreaSuggestionReason(data.reason || "");
          // Auto-select the suggested area
          setSelectedAreaId(data.suggestion.id);
          setFormData((prev) => ({ ...prev, serviceAreaId: data.suggestion.id }));
        } else {
          setAreaSuggestion(null);
          setAreaSuggestionReason(data.reason || "");
        }
        // Store all areas for manual selection
        if (data.allAreas) {
          setAllAreas(data.allAreas);
        }
      }
    } catch (error) {
      console.error("Failed to fetch area suggestion:", error);
    }
  }, []);

  // Fetch all areas on mount
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("/api/areas");
        if (response.ok) {
          const data = await response.json();
          setAllAreas(data.areas || []);
        }
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };
    fetchAreas();
  }, []);

  const behaviorOptions = [
    { value: "FRIENDLY", label: "Friendly", emoji: "😊" },
    { value: "ANXIOUS", label: "Anxious", emoji: "😰" },
    { value: "AGGRESSIVE", label: "Aggressive", emoji: "⚠️" },
    { value: "BITE_RISK", label: "Bite Risk", emoji: "🦷" },
    { value: "MUZZLE_REQUIRED", label: "Muzzle Required", emoji: "🏥" },
  ];

  const toggleBehaviorFlag = (flag: string) => {
    setFormData((prev) => ({
      ...prev,
      behaviorFlags: prev.behaviorFlags.includes(flag)
        ? prev.behaviorFlags.filter((f) => f !== flag)
        : [...prev.behaviorFlags, flag],
    }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handlePreviewLocation = async () => {
    if (!formData.address) {
      toast.error("Please enter an address first");
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formData.address }),
      });

      const data = await response.json();

      if (data.success && data.lat && data.lng) {
        setGeocodedLocation({
          lat: data.lat,
          lng: data.lng,
          status: "OK",
        });
        toast.success("Location found!");
      } else {
        setGeocodedLocation({
          lat: 0,
          lng: 0,
          status: "FAILED",
        });
        toast.error("Could not find this address on the map");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to preview location");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, action: "save" | "saveAndBook") => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      toast.error("Please fill in client name and address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save client");
      }

      const data = await response.json();
      toast.success("Client saved successfully!");

      if (action === "saveAndBook") {
        router.push(`/dashboard/appointments/new?customerId=${data.customer.id}`);
      } else {
        router.push("/dashboard/customers");
      }
    } catch (error) {
      console.error("Save client error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save client");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">New Client</h1>
        </div>
      </div>

      {/* Form */}
      <form className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Client Info Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full h-12 text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="Client name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className="input w-full h-12 text-base pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full h-12 text-base pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="client@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
              <AddressAutocomplete
                value={formData.address}
                onChange={(address) => {
                  setFormData({ ...formData, address });
                  setGeocodedLocation(null); // Reset preview when address changes manually
                }}
                onPlaceSelected={async (place) => {
                  // Auto-geocode when address is selected from autocomplete
                  if (place.geometry?.location && place.formatted_address) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    setFormData((prev) => ({ ...prev, address: place.formatted_address || "" }));
                    setGeocodedLocation({
                      lat,
                      lng,
                      status: "OK",
                    });
                    toast.success("Location found!");

                    // Try to get area suggestion based on zip code
                    const zipCode = extractZipCode(place.formatted_address || "");
                    if (zipCode) {
                      fetchAreaSuggestion(zipCode);
                    }
                  }
                }}
                placeholder="Start typing address..."
                required
                className="input w-full h-12 text-base pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Select an address from the dropdown to see it on the map
            </p>
          </div>

          {/* Map Preview */}
          {geocodedLocation && (
            <div>
              <MapPreview
                lat={geocodedLocation.status === "OK" ? geocodedLocation.lat : null}
                lng={geocodedLocation.status === "OK" ? geocodedLocation.lng : null}
                address={formData.address}
                geocodeStatus={geocodedLocation.status}
              />
            </div>
          )}

          {/* Area Suggestion */}
          {allAreas.length > 0 && geocodedLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              {areaSuggestion ? (
                <div>
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Suggested Service Area
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAreaId(areaSuggestion.id);
                            setFormData((prev) => ({ ...prev, serviceAreaId: areaSuggestion.id }));
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-colors ${
                            selectedAreaId === areaSuggestion.id
                              ? "border-blue-500 bg-blue-100"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: areaSuggestion.color }}
                          />
                          <span className="text-sm font-medium">{areaSuggestion.name}</span>
                          {selectedAreaId === areaSuggestion.id && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAreaSelector(!showAreaSelector)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {showAreaSelector ? "Hide options" : "Choose different"}
                        </button>
                      </div>
                      {areaSuggestionReason && (
                        <p className="text-xs text-blue-700 mt-2">{areaSuggestionReason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Assign to Service Area
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {areaSuggestionReason || "Select an area to help organize your routes"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAreaSelector(!showAreaSelector)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-2"
                    >
                      {showAreaSelector ? "Hide areas" : "Select area"}
                    </button>
                  </div>
                </div>
              )}

              {/* Area selector dropdown */}
              {showAreaSelector && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex flex-wrap gap-2">
                    {allAreas.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => {
                          setSelectedAreaId(area.id);
                          setFormData((prev) => ({ ...prev, serviceAreaId: area.id }));
                          setShowAreaSelector(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-colors ${
                          selectedAreaId === area.id
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="text-sm">{area.name}</span>
                        {selectedAreaId === area.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAreaId(null);
                        setFormData((prev) => ({ ...prev, serviceAreaId: null }));
                        setShowAreaSelector(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg border-2 transition-colors text-sm ${
                        selectedAreaId === null
                          ? "border-gray-400 bg-gray-100"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      No area
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Address Notes Toggle */}
          <button
            type="button"
            onClick={() => setShowAddressNotes(!showAddressNotes)}
            className="flex items-center gap-2 text-sm text-[#A5744A] font-medium hover:text-[#8B6239]"
          >
            {showAddressNotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Add gate code or parking instructions
          </button>

          {showAddressNotes && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Notes
                </label>
                <textarea
                  value={formData.addressNotes}
                  onChange={(e) => setFormData({ ...formData, addressNotes: e.target.value })}
                  className="textarea w-full text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  rows={2}
                  placeholder="Gate code, parking spot, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Instructions
                </label>
                <textarea
                  value={formData.accessInstructions}
                  onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
                  className="textarea w-full text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  rows={2}
                  placeholder="Side gate, backyard access, etc."
                />
              </div>
            </div>
          )}
        </div>

        {/* Pet Section (Optional) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            type="button"
            onClick={() => setShowPetSection(!showPetSection)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">Add Pet</h2>
              <p className="text-sm text-gray-500">Optional - you can add pets later</p>
            </div>
            {showPetSection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showPetSection && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className="input w-full h-12 text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="Max, Bella, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, species: "dog" })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.species === "dog"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-1">🐕</div>
                    <div className="text-sm font-medium">Dog</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, species: "cat" })}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      formData.species === "cat"
                        ? "border-[#A5744A] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl mb-1">🐈</div>
                    <div className="text-sm font-medium">Cat</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breed
                  </label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="input w-full h-12 text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                    placeholder="Golden Retriever"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input w-full h-12 text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                    placeholder="65"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Behavior
                </label>
                <div className="flex flex-wrap gap-2">
                  {behaviorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleBehaviorFlag(option.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                        formData.behaviorFlags.includes(option.value)
                          ? "border-[#A5744A] bg-orange-50 text-[#8B6239]"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Handling Notes
                </label>
                <textarea
                  value={formData.specialHandling}
                  onChange={(e) => setFormData({ ...formData, specialHandling: e.target.value })}
                  className="textarea w-full text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  rows={3}
                  placeholder="Any special handling requirements..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Notes Section (Optional) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">Internal Notes</h2>
              <p className="text-sm text-gray-500">For your reference only</p>
            </div>
            {showNotes ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showNotes && (
            <div className="mt-4">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="textarea w-full text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                rows={4}
                placeholder="Billing preferences, special requests, etc."
              />
            </div>
          )}
        </div>
      </form>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-64">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "save")}
            disabled={isLoading}
            className="btn flex-1 h-12 bg-white border-2 border-[#A5744A] text-[#A5744A] hover:bg-orange-50"
          >
            {isLoading ? <span className="loading loading-spinner"></span> : "Save Client"}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "saveAndBook")}
            disabled={isLoading}
            className="btn flex-1 h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            {isLoading ? <span className="loading loading-spinner"></span> : (
              <>
                <Check className="h-4 w-4" />
                Save & Book Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
