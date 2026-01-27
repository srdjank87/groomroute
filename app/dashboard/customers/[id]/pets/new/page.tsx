"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, PawPrint, ChevronDown, ChevronUp, Minus, Plus, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { suggestIntensity, type IntensitySuggestion } from "@/lib/workload-assessment";

type GroomIntensity = "LIGHT" | "MODERATE" | "DEMANDING" | "INTENSIVE";

// Intensity options with species-specific examples
const getIntensityOptions = (species: string) => [
  {
    value: "LIGHT" as GroomIntensity,
    label: "Light",
    description: "Quick, easy groom",
    examples: species === "cat"
      ? "Short coats, small cooperative cats, bath-only"
      : "Short coats, small cooperative dogs, bath-only",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    value: "MODERATE" as GroomIntensity,
    label: "Moderate",
    description: "Standard groom",
    examples: "Average coat maintenance, typical behavior",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    value: "DEMANDING" as GroomIntensity,
    label: "Demanding",
    description: "Heavy groom",
    examples: species === "cat"
      ? "Persians, Maine Coons, long-haired cats"
      : "Doodles, double coats, large dogs, wiggly pups",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
  },
  {
    value: "INTENSIVE" as GroomIntensity,
    label: "Intensive",
    description: "Marathon groom",
    examples: species === "cat"
      ? "Severely matted coats, very fearful or reactive cats"
      : "Matted coats, reactive dogs, very large + heavy coat",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
];

// Species-specific behavior options
const dogBehaviorOptions = [
  { value: "FRIENDLY", label: "Friendly", emoji: "😊" },
  { value: "ANXIOUS", label: "Anxious", emoji: "😰" },
  { value: "AGGRESSIVE", label: "Aggressive", emoji: "⚠️" },
  { value: "BITE_RISK", label: "Bite Risk", emoji: "🦷" },
  { value: "MUZZLE_REQUIRED", label: "Muzzle Required", emoji: "🏥" },
];

const catBehaviorOptions = [
  { value: "FRIENDLY", label: "Friendly", emoji: "😊" },
  { value: "ANXIOUS", label: "Anxious", emoji: "😰" },
  { value: "FEARFUL", label: "Fearful", emoji: "😨" },
  { value: "SCRATCH_RISK", label: "Scratch Risk", emoji: "🐱" },
  { value: "BITE_RISK", label: "Bite Risk", emoji: "🦷" },
];

const getBehaviorOptions = (species: string) =>
  species === "cat" ? catBehaviorOptions : dogBehaviorOptions;

// Species-specific equipment options
const dogEquipmentOptions = [
  { value: "MUZZLE", label: "Muzzle" },
  { value: "TABLE_EXTENDER", label: "Table Extender" },
  { value: "HEAVY_DUTY_DRYER", label: "Heavy Duty Dryer" },
  { value: "EXTRA_TOWELS", label: "Extra Towels" },
  { value: "SENSITIVE_SKIN_PRODUCTS", label: "Sensitive Skin Products" },
];

const catEquipmentOptions = [
  { value: "CAT_RESTRAINT_BAG", label: "Cat Restraint Bag" },
  { value: "E_COLLAR", label: "E-Collar" },
  { value: "NAIL_CAPS", label: "Nail Caps" },
  { value: "EXTRA_TOWELS", label: "Extra Towels" },
  { value: "SENSITIVE_SKIN_PRODUCTS", label: "Sensitive Skin Products" },
];

const getEquipmentOptions = (species: string) =>
  species === "cat" ? catEquipmentOptions : dogEquipmentOptions;

const sizeOptions = [
  { value: "small", label: "Small", description: "Under 20 lbs" },
  { value: "medium", label: "Medium", description: "20-50 lbs" },
  { value: "large", label: "Large", description: "50-90 lbs" },
  { value: "giant", label: "Giant", description: "90+ lbs" },
];

export default function NewPetPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    weight: "",
    size: "",
    ageYears: "",
    notes: "",
    groomingNotes: "",
    behaviorNotes: "",
    behaviorFlags: [] as string[],
    equipmentRequired: [] as string[],
    specialHandling: "",
    groomIntensity: "MODERATE" as GroomIntensity,
  });

  const toggleBehaviorFlag = (flag: string) => {
    setFormData((prev) => ({
      ...prev,
      behaviorFlags: prev.behaviorFlags.includes(flag)
        ? prev.behaviorFlags.filter((f) => f !== flag)
        : [...prev.behaviorFlags, flag],
    }));
  };

  const toggleEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipmentRequired: prev.equipmentRequired.includes(equipment)
        ? prev.equipmentRequired.filter((e) => e !== equipment)
        : [...prev.equipmentRequired, equipment],
    }));
  };

  // Calculate suggested intensity based on pet characteristics
  const intensitySuggestion = useMemo((): IntensitySuggestion | null => {
    // Only suggest if we have at least breed or weight
    if (!formData.breed && !formData.weight) return null;

    return suggestIntensity({
      breed: formData.breed || null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      species: formData.species || null,
      behaviorFlags: formData.behaviorFlags.length > 0 ? formData.behaviorFlags : null,
    });
  }, [formData.breed, formData.weight, formData.species, formData.behaviorFlags]);

  // Track if user has manually selected intensity (to know whether to auto-apply suggestion)
  const [hasManuallySelectedIntensity, setHasManuallySelectedIntensity] = useState(false);

  // Auto-apply suggestion when it changes (only if user hasn't manually selected)
  useEffect(() => {
    if (intensitySuggestion && !hasManuallySelectedIntensity) {
      setFormData((prev) => ({
        ...prev,
        groomIntensity: intensitySuggestion.intensity,
      }));
    }
  }, [intensitySuggestion, hasManuallySelectedIntensity]);

  const handleIntensitySelect = (intensity: GroomIntensity) => {
    setHasManuallySelectedIntensity(true);
    setFormData({ ...formData, groomIntensity: intensity });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter the pet's name");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/customers/${customerId}/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          species: formData.species || undefined,
          breed: formData.breed || undefined,
          weight: formData.weight ? parseFloat(formData.weight) : undefined,
          ageYears: formData.ageYears ? parseInt(formData.ageYears) : undefined,
          notes: formData.notes || undefined,
          groomingNotes: formData.groomingNotes || undefined,
          behaviorNotes: formData.behaviorNotes || undefined,
          behaviorFlags: formData.behaviorFlags.length > 0 ? formData.behaviorFlags : undefined,
          equipmentRequired: formData.equipmentRequired.length > 0 ? formData.equipmentRequired : undefined,
          specialHandling: formData.specialHandling || undefined,
          groomIntensity: formData.groomIntensity,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add pet");
      }

      toast.success("Pet added successfully!");
      router.push(`/dashboard/customers/${customerId}`);
    } catch (error) {
      console.error("Add pet error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add pet");
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
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-[#A5744A]" />
            <h1 className="text-xl font-bold text-gray-900">Add Pet</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed
            </label>
            <input
              type="text"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="input w-full h-12 text-base pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder={formData.species === "cat" ? "Persian" : "Golden Retriever"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.ageYears) || 0;
                    if (current > 0) setFormData({ ...formData, ageYears: String(current - 1) });
                  }}
                  className="btn btn-square h-12 w-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={formData.ageYears}
                  onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                  className="input flex-1 h-12 text-base text-center bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="0"
                  min="0"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseInt(formData.ageYears) || 0;
                    setFormData({ ...formData, ageYears: String(current + 1) });
                  }}
                  className="btn btn-square h-12 w-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(formData.weight) || 0;
                    if (current >= 5) setFormData({ ...formData, weight: String(current - 5) });
                  }}
                  className="btn btn-square h-12 w-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-700"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input flex-1 h-12 text-base text-center bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="0"
                  min="0"
                  step="1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(formData.weight) || 0;
                    setFormData({ ...formData, weight: String(current + 5) });
                  }}
                  className="btn btn-square h-12 w-12 bg-gray-100 hover:bg-gray-200 border-2 border-gray-200 text-gray-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Behavior */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Behavior</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Behavior Traits
            </label>
            <div className="flex flex-wrap gap-2">
              {getBehaviorOptions(formData.species).map((option) => (
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
              Behavior Notes
            </label>
            <textarea
              value={formData.behaviorNotes}
              onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
              className="textarea w-full text-base pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              rows={3}
              placeholder="Any behavioral quirks or things to watch out for..."
            />
          </div>
        </div>

        {/* Grooming */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grooming</h2>

          {/* Groom Intensity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How demanding is this groom?
            </label>
            <p className="text-xs text-gray-500 mb-3">
              This helps protect your workload - we&apos;ll warn you before your day gets too heavy.
            </p>

            {/* Suggestion Banner */}
            {intensitySuggestion && (
              <div className={`mb-3 p-3 rounded-lg border ${
                intensitySuggestion.confidence === "high"
                  ? "bg-emerald-50 border-emerald-200"
                  : intensitySuggestion.confidence === "medium"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
              }`}>
                <div className="flex items-start gap-2">
                  <Sparkles className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    intensitySuggestion.confidence === "high"
                      ? "text-emerald-500"
                      : intensitySuggestion.confidence === "medium"
                        ? "text-blue-500"
                        : "text-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        Suggested: <span className={getIntensityOptions(formData.species).find(o => o.value === intensitySuggestion.intensity)?.color}>
                          {getIntensityOptions(formData.species).find(o => o.value === intensitySuggestion.intensity)?.label}
                        </span>
                      </span>
                      {formData.groomIntensity !== intensitySuggestion.intensity && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, groomIntensity: intensitySuggestion.intensity });
                            setHasManuallySelectedIntensity(false);
                          }}
                          className="text-xs px-2 py-0.5 rounded bg-white border border-gray-300 hover:border-gray-400 text-gray-700"
                        >
                          Use suggestion
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {intensitySuggestion.reasons.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {getIntensityOptions(formData.species).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleIntensitySelect(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    formData.groomIntensity === option.value
                      ? `${option.bgColor} border-current ${option.color}`
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`font-semibold text-sm ${
                    formData.groomIntensity === option.value ? option.color : "text-gray-900"
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {option.examples}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grooming Notes
            </label>
            <textarea
              value={formData.groomingNotes}
              onChange={(e) => setFormData({ ...formData, groomingNotes: e.target.value })}
              className="textarea w-full text-base pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              rows={3}
              placeholder="Preferred styles, sensitivities, matting issues..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="textarea w-full text-base pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              rows={2}
              placeholder="Any other notes about this pet..."
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between"
          >
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">Advanced Settings</h2>
              <p className="text-sm text-gray-500">Equipment requirements, special handling</p>
            </div>
            {showAdvanced ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {getEquipmentOptions(formData.species).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleEquipment(option.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm font-medium ${
                        formData.equipmentRequired.includes(option.value)
                          ? "border-[#A5744A] bg-orange-50 text-[#8B6239]"
                          : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Handling Instructions
                </label>
                <textarea
                  value={formData.specialHandling}
                  onChange={(e) => setFormData({ ...formData, specialHandling: e.target.value })}
                  className="textarea w-full text-base pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  rows={3}
                  placeholder="Detailed handling instructions for difficult pets..."
                />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-64">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="btn w-full h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Pet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
