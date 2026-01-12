"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Save, Trash2, PawPrint, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  weight?: number;
  ageYears?: number;
  notes?: string;
  groomingNotes?: string;
  behaviorNotes?: string;
  behaviorFlags: string[];
  equipmentRequired: string[];
  specialHandling?: string;
  canBookSolo: boolean;
}

const behaviorOptions = [
  { value: "FRIENDLY", label: "Friendly", emoji: "😊" },
  { value: "ANXIOUS", label: "Anxious", emoji: "😰" },
  { value: "AGGRESSIVE", label: "Aggressive", emoji: "⚠️" },
  { value: "BITE_RISK", label: "Bite Risk", emoji: "🦷" },
  { value: "MUZZLE_REQUIRED", label: "Muzzle Required", emoji: "🏥" },
  { value: "TWO_PERSON_REQUIRED", label: "2-Person Required", emoji: "👥" },
];

const equipmentOptions = [
  { value: "MUZZLE", label: "Muzzle" },
  { value: "TABLE_EXTENDER", label: "Table Extender" },
  { value: "HEAVY_DUTY_DRYER", label: "Heavy Duty Dryer" },
  { value: "EXTRA_TOWELS", label: "Extra Towels" },
  { value: "SENSITIVE_SKIN_PRODUCTS", label: "Sensitive Skin Products" },
];

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const petId = params.petId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    weight: "",
    ageYears: "",
    notes: "",
    groomingNotes: "",
    behaviorNotes: "",
    behaviorFlags: [] as string[],
    equipmentRequired: [] as string[],
    specialHandling: "",
    canBookSolo: true,
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/customers/${customerId}/pets/${petId}`);
        if (response.ok) {
          const data = await response.json();
          setPet(data);
          setFormData({
            name: data.name || "",
            species: data.species || "dog",
            breed: data.breed || "",
            weight: data.weight?.toString() || "",
            ageYears: data.ageYears?.toString() || "",
            notes: data.notes || "",
            groomingNotes: data.groomingNotes || "",
            behaviorNotes: data.behaviorNotes || "",
            behaviorFlags: data.behaviorFlags || [],
            equipmentRequired: data.equipmentRequired || [],
            specialHandling: data.specialHandling || "",
            canBookSolo: data.canBookSolo ?? true,
          });
          // Show advanced section if there's data in it
          if (data.equipmentRequired?.length > 0 || data.specialHandling || !data.canBookSolo) {
            setShowAdvanced(true);
          }
        } else {
          toast.error("Pet not found");
          router.push(`/dashboard/customers/${customerId}`);
        }
      } catch (error) {
        console.error("Failed to fetch pet:", error);
        toast.error("Failed to load pet");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [customerId, petId, router]);

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

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter the pet's name");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/customers/${customerId}/pets/${petId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          species: formData.species || null,
          breed: formData.breed || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          ageYears: formData.ageYears ? parseInt(formData.ageYears) : null,
          notes: formData.notes || null,
          groomingNotes: formData.groomingNotes || null,
          behaviorNotes: formData.behaviorNotes || null,
          behaviorFlags: formData.behaviorFlags,
          equipmentRequired: formData.equipmentRequired,
          specialHandling: formData.specialHandling || null,
          canBookSolo: formData.canBookSolo,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update pet");
      }

      toast.success("Pet updated successfully!");
      router.push(`/dashboard/customers/${customerId}`);
    } catch (error) {
      console.error("Update pet error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update pet");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${pet?.name}? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/customers/${customerId}/pets/${petId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete pet");
      }

      toast.success("Pet removed successfully");
      router.push(`/dashboard/customers/${customerId}`);
    } catch (error) {
      console.error("Delete pet error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove pet");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!pet) {
    return null;
  }

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
            <h1 className="text-xl font-bold text-gray-900">Edit {pet.name}</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
              className="input w-full h-12 text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
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
                className="input w-full h-12 text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                placeholder="Golden Retriever"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (years)
              </label>
              <input
                type="number"
                value={formData.ageYears}
                onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                className="input w-full h-12 text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                placeholder="3"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="input w-full h-12 text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="65"
              min="0"
              step="0.1"
            />
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
              Behavior Notes
            </label>
            <textarea
              value={formData.behaviorNotes}
              onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
              className="textarea w-full text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              rows={3}
              placeholder="Any behavioral quirks or things to watch out for..."
            />
          </div>
        </div>

        {/* Grooming Notes */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grooming</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grooming Notes
            </label>
            <textarea
              value={formData.groomingNotes}
              onChange={(e) => setFormData({ ...formData, groomingNotes: e.target.value })}
              className="textarea w-full text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
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
              className="textarea w-full text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
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
                  {equipmentOptions.map((option) => (
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
                  className="textarea w-full text-base bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  rows={3}
                  placeholder="Detailed handling instructions for difficult pets..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="canBookSolo"
                  checked={formData.canBookSolo}
                  onChange={(e) => setFormData({ ...formData, canBookSolo: e.target.checked })}
                  className="checkbox checkbox-primary"
                />
                <label htmlFor="canBookSolo" className="text-sm">
                  <span className="font-medium">Can be booked solo</span>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Uncheck if this pet requires 2-person handling
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Delete Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Remove Pet</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-ghost text-red-600 hover:bg-red-50 gap-2"
            >
              {isDeleting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:pl-64">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn w-full h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            {isSaving ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
