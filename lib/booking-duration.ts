/**
 * Booking Duration Estimation
 *
 * Estimates appointment duration based on pet characteristics.
 * Used for public booking pages to show appropriate available time slots.
 */

import { suggestIntensity } from "./workload-assessment";

// Duration in minutes for each intensity level
const INTENSITY_DURATIONS = {
  LIGHT: 45,      // Quick grooms - short coats, small cooperative pets
  MODERATE: 60,   // Standard grooms - average maintenance
  DEMANDING: 90,  // Heavy grooms - doodles, double coats, large dogs
  INTENSIVE: 120, // Marathon grooms - matted, reactive, very large + heavy coat
};

// Size to approximate weight mapping (for when weight isn't known)
const SIZE_WEIGHTS = {
  dog: {
    small: 15,    // 0-20 lbs, use midpoint
    medium: 35,   // 20-50 lbs
    large: 65,    // 50-80 lbs
    giant: 100,   // 80+ lbs
  },
  cat: {
    small: 6,     // Under 8 lbs
    medium: 10,   // 8-12 lbs
    large: 15,    // Over 12 lbs
  },
};

export interface DurationEstimate {
  minutes: number;
  intensity: "LIGHT" | "MODERATE" | "DEMANDING" | "INTENSIVE";
  reasons: string[];
  confidence: "high" | "medium" | "low";
}

/**
 * Estimate appointment duration based on pet details
 */
export function estimateDuration(pet: {
  species: "dog" | "cat";
  breed: string;
  size: "small" | "medium" | "large" | "giant";
}): DurationEstimate {
  // Get approximate weight from size
  const sizeWeights = pet.species === "dog" ? SIZE_WEIGHTS.dog : SIZE_WEIGHTS.cat;
  const weight = sizeWeights[pet.size as keyof typeof sizeWeights] ?? 35;

  // Use the workload assessment system to suggest intensity
  const suggestion = suggestIntensity({
    breed: pet.breed,
    weight,
    species: pet.species,
  });

  // Get duration from intensity
  const minutes = INTENSITY_DURATIONS[suggestion.intensity];

  return {
    minutes,
    intensity: suggestion.intensity,
    reasons: suggestion.reasons,
    confidence: suggestion.confidence,
  };
}

/**
 * Get a human-readable duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Get default duration when pet details aren't available
 * Used as fallback
 */
export function getDefaultDuration(): number {
  return INTENSITY_DURATIONS.MODERATE; // 60 minutes
}
