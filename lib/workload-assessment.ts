/**
 * Unified Workload Assessment System
 *
 * Provides consistent day intensity evaluation across the app.
 * Takes into account appointment count, total grooming minutes,
 * groom intensity levels, and whether working with an assistant.
 *
 * INTENSITY SYSTEM:
 * Each pet has a groomIntensity level assigned by the groomer:
 * - LIGHT (1): Quick grooms - short coats, small cooperative dogs, bath-only
 * - MODERATE (2): Standard grooms - average coat maintenance, typical behavior
 * - DEMANDING (3): Heavy grooms - doodles, double coats, full coats, large dogs
 * - INTENSIVE (4): Marathon grooms - matted coats, reactive dogs, very large + heavy coat
 *
 * The daily limit (default 12) represents total intensity the groomer can handle.
 * Example: 12 = roughly 6 moderate grooms, or 4 demanding grooms, or 3 intensive grooms
 */

import { GroomIntensity } from "@prisma/client";

// Intensity values for each level
export const INTENSITY_VALUES: Record<GroomIntensity, number> = {
  LIGHT: 1,
  MODERATE: 2,
  DEMANDING: 3,
  INTENSIVE: 4,
};

// Default daily limit (null = no limit)
export const DEFAULT_DAILY_INTENSITY_LIMIT = 12;

// Intensity level display info
export const INTENSITY_INFO: Record<GroomIntensity, {
  label: string;
  description: string;
  examples: string;
  color: string;
  bgColor: string;
}> = {
  LIGHT: {
    label: "Light",
    description: "Quick, easy groom",
    examples: "Short coats, small cooperative dogs, bath-only services",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  MODERATE: {
    label: "Moderate",
    description: "Standard groom",
    examples: "Average coat maintenance, typical behavior, routine appointments",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  DEMANDING: {
    label: "Demanding",
    description: "Heavy groom",
    examples: "Doodles, double coats, full coats, large dogs, wiggly pups",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  INTENSIVE: {
    label: "Intensive",
    description: "Marathon groom",
    examples: "Matted coats, reactive dogs, very large dogs with heavy coats",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

// Breed patterns for intensity suggestion
// These are case-insensitive substring matches
const BREED_INTENSITY_PATTERNS: {
  pattern: RegExp;
  intensity: GroomIntensity;
  reason: string;
}[] = [
  // INTENSIVE breeds - marathon grooms
  { pattern: /malamute/i, intensity: "INTENSIVE", reason: "large double coat" },
  { pattern: /newfoundland|newf/i, intensity: "INTENSIVE", reason: "giant heavy coat" },
  { pattern: /saint\s*bernard|st\.\s*bernard/i, intensity: "INTENSIVE", reason: "giant heavy coat" },
  { pattern: /great\s*pyrenees/i, intensity: "INTENSIVE", reason: "giant double coat" },
  { pattern: /bernese/i, intensity: "INTENSIVE", reason: "large double coat" },
  { pattern: /tibetan\s*mastiff/i, intensity: "INTENSIVE", reason: "giant heavy coat" },
  { pattern: /komondor/i, intensity: "INTENSIVE", reason: "corded coat requires special care" },
  { pattern: /afghan\s*hound/i, intensity: "INTENSIVE", reason: "long flowing coat" },

  // DEMANDING breeds - heavy grooms
  { pattern: /doodle|poo($|\s)|oodle/i, intensity: "DEMANDING", reason: "doodle coat requires extensive work" },
  { pattern: /poodle/i, intensity: "DEMANDING", reason: "curly coat requires careful grooming" },
  { pattern: /bichon/i, intensity: "DEMANDING", reason: "fluffy coat needs regular maintenance" },
  { pattern: /husky/i, intensity: "DEMANDING", reason: "heavy double coat shedding" },
  { pattern: /samoyed/i, intensity: "DEMANDING", reason: "thick white double coat" },
  { pattern: /chow/i, intensity: "DEMANDING", reason: "dense double coat" },
  { pattern: /akita/i, intensity: "DEMANDING", reason: "thick double coat" },
  { pattern: /collie/i, intensity: "DEMANDING", reason: "long double coat" },
  { pattern: /sheltie|shetland/i, intensity: "DEMANDING", reason: "long double coat" },
  { pattern: /golden\s*retriever/i, intensity: "DEMANDING", reason: "long coat with feathering" },
  { pattern: /cocker\s*spaniel/i, intensity: "DEMANDING", reason: "long coat prone to matting" },
  { pattern: /springer\s*spaniel/i, intensity: "DEMANDING", reason: "long coat with feathering" },
  { pattern: /cavalier/i, intensity: "DEMANDING", reason: "long silky coat" },
  { pattern: /shih\s*tzu/i, intensity: "DEMANDING", reason: "long coat needs regular grooming" },
  { pattern: /maltese/i, intensity: "DEMANDING", reason: "long white coat" },
  { pattern: /yorkie|yorkshire/i, intensity: "DEMANDING", reason: "long silky coat" },
  { pattern: /havanese/i, intensity: "DEMANDING", reason: "long silky coat" },
  { pattern: /old\s*english\s*sheepdog/i, intensity: "DEMANDING", reason: "heavy shaggy coat" },
  { pattern: /australian\s*shepherd|aussie/i, intensity: "DEMANDING", reason: "double coat with feathering" },
  { pattern: /german\s*shepherd/i, intensity: "DEMANDING", reason: "double coat shedding" },
  { pattern: /border\s*collie/i, intensity: "DEMANDING", reason: "double coat" },
  // DEMANDING cats - long/dense coats requiring significant work
  { pattern: /persian/i, intensity: "DEMANDING", reason: "long dense coat" },
  { pattern: /maine\s*coon/i, intensity: "DEMANDING", reason: "large cat with long coat" },
  { pattern: /ragdoll/i, intensity: "DEMANDING", reason: "semi-long silky coat" },
  { pattern: /himalayan/i, intensity: "DEMANDING", reason: "long dense coat" },
  { pattern: /norwegian\s*forest/i, intensity: "DEMANDING", reason: "long thick double coat" },
  { pattern: /siberian/i, intensity: "DEMANDING", reason: "long triple coat" },
  { pattern: /birman/i, intensity: "DEMANDING", reason: "semi-long silky coat" },
  { pattern: /turkish\s*angora/i, intensity: "DEMANDING", reason: "long silky coat" },
  { pattern: /british\s*longhair/i, intensity: "DEMANDING", reason: "dense long coat" },
  { pattern: /balinese/i, intensity: "DEMANDING", reason: "long silky coat" },
  { pattern: /somali/i, intensity: "DEMANDING", reason: "long ticked coat" },
  { pattern: /turkish\s*van/i, intensity: "DEMANDING", reason: "semi-long water-resistant coat" },
  { pattern: /nebelung/i, intensity: "DEMANDING", reason: "long blue double coat" },
  { pattern: /laperm/i, intensity: "DEMANDING", reason: "curly coat needs careful handling" },
  { pattern: /selkirk\s*rex/i, intensity: "DEMANDING", reason: "curly coat needs careful handling" },
  { pattern: /ragamuffin/i, intensity: "DEMANDING", reason: "long silky coat" },

  // MODERATE breeds - standard grooms (explicitly listed for clarity)
  { pattern: /labrador|lab($|\s)/i, intensity: "MODERATE", reason: "short double coat" },
  { pattern: /beagle/i, intensity: "MODERATE", reason: "short easy-care coat" },
  { pattern: /boxer/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /pit\s*bull|pitbull|stafford/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /rottweiler/i, intensity: "MODERATE", reason: "short double coat" },
  { pattern: /doberman/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /pointer/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /vizsla/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /weimaraner/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /brittany/i, intensity: "MODERATE", reason: "medium wavy coat" },
  { pattern: /schnauzer/i, intensity: "MODERATE", reason: "wiry coat" },
  { pattern: /terrier/i, intensity: "MODERATE", reason: "wiry coat" },
  { pattern: /dachshund/i, intensity: "MODERATE", reason: "short to medium coat" },
  { pattern: /corgi/i, intensity: "MODERATE", reason: "double coat, small size" },
  { pattern: /pug/i, intensity: "MODERATE", reason: "short coat, compact size" },
  { pattern: /bulldog/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /boston/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /frenchie|french\s*bulldog/i, intensity: "MODERATE", reason: "short smooth coat" },
  { pattern: /shiba/i, intensity: "MODERATE", reason: "double coat, small size" },
  { pattern: /mix|mutt|mixed/i, intensity: "MODERATE", reason: "mixed breed" },

  // MODERATE cats - medium maintenance coats
  { pattern: /exotic\s*shorthair/i, intensity: "MODERATE", reason: "dense plush coat" },
  { pattern: /british\s*shorthair/i, intensity: "MODERATE", reason: "dense plush coat" },
  { pattern: /scottish\s*fold/i, intensity: "MODERATE", reason: "dense double coat" },
  { pattern: /manx/i, intensity: "MODERATE", reason: "dense double coat" },
  { pattern: /american\s*shorthair/i, intensity: "MODERATE", reason: "dense working coat" },
  { pattern: /chartreux/i, intensity: "MODERATE", reason: "dense woolly coat" },
  { pattern: /tonkinese/i, intensity: "MODERATE", reason: "medium maintenance coat" },
  { pattern: /snowshoe/i, intensity: "MODERATE", reason: "medium coat" },
  { pattern: /domestic\s*(medium|long)/i, intensity: "MODERATE", reason: "medium to long coat" },

  // LIGHT breeds - quick easy grooms
  { pattern: /chihuahua/i, intensity: "LIGHT", reason: "tiny with short coat" },
  { pattern: /italian\s*greyhound/i, intensity: "LIGHT", reason: "tiny with minimal coat" },
  { pattern: /whippet/i, intensity: "LIGHT", reason: "short smooth coat" },
  { pattern: /greyhound/i, intensity: "LIGHT", reason: "short smooth coat" },
  { pattern: /basenji/i, intensity: "LIGHT", reason: "short coat, self-cleaning" },
  { pattern: /min\s*pin|miniature\s*pinscher/i, intensity: "LIGHT", reason: "tiny with short coat" },
  { pattern: /rat\s*terrier/i, intensity: "LIGHT", reason: "small with short coat" },
  { pattern: /hairless/i, intensity: "LIGHT", reason: "minimal grooming needed" },
  { pattern: /chinese\s*crested/i, intensity: "LIGHT", reason: "minimal coat" },
  // LIGHT cats - minimal grooming needs
  { pattern: /siamese/i, intensity: "LIGHT", reason: "short smooth coat" },
  { pattern: /domestic\s*short/i, intensity: "LIGHT", reason: "short easy coat" },
  { pattern: /bengal/i, intensity: "LIGHT", reason: "short sleek coat" },
  { pattern: /abyssinian/i, intensity: "LIGHT", reason: "short ticked coat" },
  { pattern: /burmese/i, intensity: "LIGHT", reason: "short satin coat" },
  { pattern: /russian\s*blue/i, intensity: "LIGHT", reason: "short dense coat, easy care" },
  { pattern: /bombay/i, intensity: "LIGHT", reason: "short sleek coat" },
  { pattern: /oriental\s*(shorthair)?/i, intensity: "LIGHT", reason: "short smooth coat" },
  { pattern: /cornish\s*rex/i, intensity: "LIGHT", reason: "short wavy coat" },
  { pattern: /devon\s*rex/i, intensity: "LIGHT", reason: "short wavy coat" },
  { pattern: /sphynx/i, intensity: "LIGHT", reason: "hairless, minimal grooming" },
  { pattern: /korat/i, intensity: "LIGHT", reason: "short single coat" },
  { pattern: /singapura/i, intensity: "LIGHT", reason: "short ticked coat" },
  { pattern: /ocicat/i, intensity: "LIGHT", reason: "short spotted coat" },
  { pattern: /egyptian\s*mau/i, intensity: "LIGHT", reason: "short spotted coat" },
  { pattern: /havana\s*brown/i, intensity: "LIGHT", reason: "short smooth coat" },
  { pattern: /american\s*curl/i, intensity: "LIGHT", reason: "short to medium coat" },
  { pattern: /japanese\s*bobtail/i, intensity: "LIGHT", reason: "short to medium coat" },
];

// Weight thresholds for intensity adjustment (in lbs)
const WEIGHT_THRESHOLDS = {
  small: 20,    // Under 20 lbs
  medium: 50,   // 20-50 lbs
  large: 80,    // 50-80 lbs
  giant: 80,    // Over 80 lbs
};

export interface IntensitySuggestion {
  intensity: GroomIntensity;
  reasons: string[];
  confidence: "high" | "medium" | "low";
  fromBreed: boolean;
  fromWeight: boolean;
  fromBehavior: boolean;
}

/**
 * Suggest an intensity level based on pet characteristics
 * Returns a suggestion with reasoning the groomer can review
 */
export function suggestIntensity(pet: {
  breed?: string | null;
  weight?: number | null;
  species?: string | null;
  behaviorFlags?: string[] | null;
}): IntensitySuggestion {
  const reasons: string[] = [];
  let baseIntensity: GroomIntensity = "MODERATE";
  let fromBreed = false;
  let fromWeight = false;
  let fromBehavior = false;

  // 1. Check breed patterns first (most reliable indicator)
  if (pet.breed) {
    const breedLower = pet.breed.toLowerCase().trim();
    for (const { pattern, intensity, reason } of BREED_INTENSITY_PATTERNS) {
      if (pattern.test(breedLower)) {
        baseIntensity = intensity;
        reasons.push(`${pet.breed}: ${reason}`);
        fromBreed = true;
        break;
      }
    }
  }

  // 2. Adjust based on weight (can increase but not decrease)
  if (pet.weight) {
    const weight = pet.weight;
    const isCat = pet.species?.toLowerCase() === "cat";

    if (isCat) {
      // Cats: weight thresholds are lower
      if (weight >= 15 && baseIntensity !== "INTENSIVE") {
        // Very large cat (15+ lbs) - bump up if not already intensive
        const intensityOrder: GroomIntensity[] = ["LIGHT", "MODERATE", "DEMANDING", "INTENSIVE"];
        const currentIndex = intensityOrder.indexOf(baseIntensity);
        if (currentIndex < 3) {
          baseIntensity = intensityOrder[currentIndex + 1];
          reasons.push(`Large cat (${weight} lbs)`);
          fromWeight = true;
        }
      }
    } else {
      // Dogs: standard weight thresholds
      if (weight >= WEIGHT_THRESHOLDS.giant) {
        // Giant dog (80+ lbs) - at least DEMANDING, bump to INTENSIVE if already DEMANDING
        if (baseIntensity === "LIGHT" || baseIntensity === "MODERATE") {
          baseIntensity = "DEMANDING";
          reasons.push(`Giant size (${weight} lbs)`);
          fromWeight = true;
        } else if (baseIntensity === "DEMANDING") {
          baseIntensity = "INTENSIVE";
          reasons.push(`Giant size (${weight} lbs)`);
          fromWeight = true;
        }
      } else if (weight >= WEIGHT_THRESHOLDS.large) {
        // Large dog (50-80 lbs) - at least MODERATE, can bump to DEMANDING
        if (baseIntensity === "LIGHT") {
          baseIntensity = "MODERATE";
          reasons.push(`Large size (${weight} lbs)`);
          fromWeight = true;
        }
      } else if (weight < WEIGHT_THRESHOLDS.small && !fromBreed) {
        // Small dog (under 20 lbs) and no breed match - can suggest LIGHT
        if (baseIntensity === "MODERATE") {
          baseIntensity = "LIGHT";
          reasons.push(`Small size (${weight} lbs)`);
          fromWeight = true;
        }
      }
    }
  }

  // 3. Behavior flags can only increase intensity
  if (pet.behaviorFlags && pet.behaviorFlags.length > 0) {
    const hasDifficultBehavior = pet.behaviorFlags.some(
      (flag) => ["AGGRESSIVE", "BITE_RISK", "MUZZLE_REQUIRED"].includes(flag)
    );
    const hasAnxious = pet.behaviorFlags.includes("ANXIOUS");

    if (hasDifficultBehavior) {
      // Difficult behavior bumps up at least one level
      const intensityOrder: GroomIntensity[] = ["LIGHT", "MODERATE", "DEMANDING", "INTENSIVE"];
      const currentIndex = intensityOrder.indexOf(baseIntensity);
      if (currentIndex < 3) {
        baseIntensity = intensityOrder[currentIndex + 1];
        const flags = pet.behaviorFlags
          .filter((f) => ["AGGRESSIVE", "BITE_RISK", "MUZZLE_REQUIRED"].includes(f))
          .map((f) => f.replace(/_/g, " ").toLowerCase())
          .join(", ");
        reasons.push(`Behavior: ${flags}`);
        fromBehavior = true;
      }
    } else if (hasAnxious && baseIntensity === "LIGHT") {
      // Anxious dogs need more time/patience
      baseIntensity = "MODERATE";
      reasons.push("Anxious behavior needs extra patience");
      fromBehavior = true;
    }
  }

  // Determine confidence level
  let confidence: "high" | "medium" | "low";
  if (fromBreed && (fromWeight || !pet.weight)) {
    confidence = "high";
  } else if (fromBreed || (fromWeight && pet.weight && pet.weight >= 50)) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  // If no specific reasons, add a default one
  if (reasons.length === 0) {
    reasons.push("Default for unknown breed/size");
  }

  return {
    intensity: baseIntensity,
    reasons,
    confidence,
    fromBreed,
    fromWeight,
    fromBehavior,
  };
}

/**
 * Calculate total intensity for a list of appointments
 */
export function calculateTotalIntensity(
  appointments: Array<{ pet?: { groomIntensity?: GroomIntensity | null } | null }>
): number {
  return appointments.reduce((total, apt) => {
    const intensity = apt.pet?.groomIntensity ?? "MODERATE";
    return total + INTENSITY_VALUES[intensity];
  }, 0);
}

/**
 * Check if adding an appointment would exceed the daily intensity limit
 * Returns { allowed, currentTotal, wouldBeTotal, limit, remaining }
 */
export function checkIntensityLimit(
  currentAppointments: Array<{ pet?: { groomIntensity?: GroomIntensity | null } | null }>,
  newPetIntensity: GroomIntensity,
  dailyLimit: number | null
): {
  allowed: boolean;
  currentTotal: number;
  wouldBeTotal: number;
  limit: number | null;
  remaining: number | null;
  overBy: number;
} {
  const currentTotal = calculateTotalIntensity(currentAppointments);
  const newValue = INTENSITY_VALUES[newPetIntensity];
  const wouldBeTotal = currentTotal + newValue;

  if (dailyLimit === null) {
    return {
      allowed: true,
      currentTotal,
      wouldBeTotal,
      limit: null,
      remaining: null,
      overBy: 0,
    };
  }

  const allowed = wouldBeTotal <= dailyLimit;
  const remaining = Math.max(0, dailyLimit - currentTotal);
  const overBy = allowed ? 0 : wouldBeTotal - dailyLimit;

  return {
    allowed,
    currentTotal,
    wouldBeTotal,
    limit: dailyLimit,
    remaining,
    overBy,
  };
}

/**
 * Get a percentage of daily intensity used (for progress bars)
 */
export function getIntensityPercentage(
  appointments: Array<{ pet?: { groomIntensity?: GroomIntensity | null } | null }>,
  dailyLimit: number | null
): number {
  if (dailyLimit === null || dailyLimit === 0) return 0;
  const total = calculateTotalIntensity(appointments);
  return Math.min(100, Math.round((total / dailyLimit) * 100));
}

/**
 * Get intensity status for display (color, message)
 */
export function getIntensityStatus(
  appointments: Array<{ pet?: { groomIntensity?: GroomIntensity | null } | null }>,
  dailyLimit: number | null
): {
  level: "light" | "moderate" | "busy" | "heavy" | "overloaded";
  color: string;
  bgColor: string;
  message: string;
} {
  if (dailyLimit === null) {
    return {
      level: "moderate",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      message: "No daily limit set",
    };
  }

  const total = calculateTotalIntensity(appointments);
  const percentage = (total / dailyLimit) * 100;

  if (percentage === 0) {
    return {
      level: "light",
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      message: "No appointments scheduled",
    };
  } else if (percentage <= 50) {
    return {
      level: "light",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      message: "Light day - plenty of capacity",
    };
  } else if (percentage <= 75) {
    return {
      level: "moderate",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      message: "Balanced day",
    };
  } else if (percentage <= 90) {
    return {
      level: "busy",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      message: "Busy day - approaching your limit",
    };
  } else if (percentage <= 100) {
    return {
      level: "heavy",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      message: "At capacity",
    };
  } else {
    return {
      level: "overloaded",
      color: "text-red-600",
      bgColor: "bg-red-100",
      message: "Over your daily limit",
    };
  }
}

export type WorkloadLevel =
  | "day-off"      // No appointments
  | "light"        // Easy day, plenty of breathing room
  | "moderate"     // Normal workload, manageable
  | "busy"         // Above average, requires focus
  | "heavy"        // Challenging day, limited flexibility
  | "overloaded";  // Too much - consider relief options

export interface WorkloadInput {
  appointmentCount: number;
  totalMinutes: number;         // Total grooming time in minutes
  largeDogCount: number;        // Dogs over 50 lbs
  hasAssistant: boolean;        // Working with bather/assistant
  completedCount?: number;      // Already completed (for remaining calculation)
}

export interface WorkloadAssessment {
  level: WorkloadLevel;
  label: string;              // Display label (e.g., "Busy Day")
  message: string;            // Calm, supportive message
  color: string;              // Tailwind color class (e.g., "bg-amber-500")
  textColor: string;          // Text color class
  emoji: string;              // Status emoji
  showCalmLink: boolean;      // Whether to show link to Calm Center
  stressPoints: string[];     // Specific concerns for the day
  workloadScore: number;      // Numeric score 0-100 for comparison
}

// Thresholds for solo groomer (baseline)
const SOLO_THRESHOLDS = {
  light: { maxAppointments: 3, maxMinutes: 180 },      // Up to 3 appointments or 3 hours
  moderate: { maxAppointments: 5, maxMinutes: 300 },   // Up to 5 appointments or 5 hours
  busy: { maxAppointments: 7, maxMinutes: 420 },       // Up to 7 appointments or 7 hours
  heavy: { maxAppointments: 9, maxMinutes: 540 },      // Up to 9 appointments or 9 hours
  // Above heavy = overloaded
};

// Assistant multiplier - with help, capacity increases by ~40%
const ASSISTANT_MULTIPLIER = 1.4;

// Large dog penalty - each large dog adds "weight" to the day
const LARGE_DOG_WEIGHT = 0.3; // Each large dog counts as 0.3 extra appointments in terms of fatigue

/**
 * Calculate effective appointment count considering large dogs
 */
function getEffectiveAppointmentCount(appointmentCount: number, largeDogCount: number): number {
  return appointmentCount + (largeDogCount * LARGE_DOG_WEIGHT);
}

/**
 * Get thresholds adjusted for assistant
 */
function getAdjustedThresholds(hasAssistant: boolean) {
  const multiplier = hasAssistant ? ASSISTANT_MULTIPLIER : 1;
  return {
    light: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.light.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.light.maxMinutes * multiplier),
    },
    moderate: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.moderate.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.moderate.maxMinutes * multiplier),
    },
    busy: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.busy.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.busy.maxMinutes * multiplier),
    },
    heavy: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.heavy.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.heavy.maxMinutes * multiplier),
    },
  };
}

/**
 * Calculate a numeric workload score (0-100)
 * Used for comparison and progress tracking
 */
function calculateWorkloadScore(input: WorkloadInput): number {
  const thresholds = getAdjustedThresholds(input.hasAssistant);
  const effectiveCount = getEffectiveAppointmentCount(input.appointmentCount, input.largeDogCount);

  // Score based on effective appointment count relative to heavy threshold
  const appointmentScore = (effectiveCount / thresholds.heavy.maxAppointments) * 100;

  // Score based on minutes relative to heavy threshold
  const minuteScore = (input.totalMinutes / thresholds.heavy.maxMinutes) * 100;

  // Take the higher of the two (limiting factor)
  return Math.min(100, Math.max(appointmentScore, minuteScore));
}

/**
 * Determine workload level based on inputs
 */
function determineWorkloadLevel(input: WorkloadInput): WorkloadLevel {
  if (input.appointmentCount === 0) {
    return "day-off";
  }

  const thresholds = getAdjustedThresholds(input.hasAssistant);
  const effectiveCount = getEffectiveAppointmentCount(input.appointmentCount, input.largeDogCount);

  // Check appointment count and total minutes against thresholds
  // Use whichever metric pushes the level higher (the limiting factor)

  if (effectiveCount <= thresholds.light.maxAppointments && input.totalMinutes <= thresholds.light.maxMinutes) {
    return "light";
  }

  if (effectiveCount <= thresholds.moderate.maxAppointments && input.totalMinutes <= thresholds.moderate.maxMinutes) {
    return "moderate";
  }

  if (effectiveCount <= thresholds.busy.maxAppointments && input.totalMinutes <= thresholds.busy.maxMinutes) {
    return "busy";
  }

  if (effectiveCount <= thresholds.heavy.maxAppointments && input.totalMinutes <= thresholds.heavy.maxMinutes) {
    return "heavy";
  }

  return "overloaded";
}

/**
 * Get stress points for the day
 */
function getStressPoints(input: WorkloadInput, level: WorkloadLevel): string[] {
  const points: string[] = [];
  const thresholds = getAdjustedThresholds(input.hasAssistant);

  // Large dog concerns
  if (input.largeDogCount >= 3) {
    points.push(`${input.largeDogCount} large dogs today - pace yourself`);
  } else if (input.largeDogCount >= 2) {
    points.push(`${input.largeDogCount} large dogs scheduled`);
  }

  // Long day concerns
  if (input.totalMinutes > thresholds.busy.maxMinutes) {
    const hours = Math.round(input.totalMinutes / 60);
    points.push(`${hours}+ hours of grooming time`);
  }

  // Back-to-back concerns (implicit from high count)
  if (input.appointmentCount > thresholds.moderate.maxAppointments) {
    points.push("Busy schedule with limited breaks");
  }

  // Overload warning
  if (level === "overloaded") {
    points.push("Consider rescheduling or adding buffer time");
  }

  return points;
}

/**
 * Get display properties for each workload level
 */
function getLevelDisplay(level: WorkloadLevel, hasAssistant: boolean): {
  label: string;
  message: string;
  color: string;
  textColor: string;
  emoji: string;
  showCalmLink: boolean;
} {
  switch (level) {
    case "day-off":
      return {
        label: "Day Off",
        message: "Enjoy your rest day",
        color: "bg-gray-400",
        textColor: "text-gray-600",
        emoji: "🌴",
        showCalmLink: false,
      };

    case "light":
      return {
        label: "Light Day",
        message: hasAssistant
          ? "Easy day with your assistant - smooth sailing ahead"
          : "A light, manageable day ahead",
        color: "bg-emerald-500",
        textColor: "text-emerald-600",
        emoji: "🌿",
        showCalmLink: false,
      };

    case "moderate":
      return {
        label: "Moderate Day",
        message: hasAssistant
          ? "Normal workload - you and your assistant have this handled"
          : "A balanced day with good pacing",
        color: "bg-blue-500",
        textColor: "text-blue-600",
        emoji: "👍",
        showCalmLink: false,
      };

    case "busy":
      return {
        label: "Busy Day",
        message: hasAssistant
          ? "Full schedule today, but with your assistant you've got this"
          : "Active day ahead - stay focused and pace yourself",
        color: "bg-amber-500",
        textColor: "text-amber-600",
        emoji: "⚡",
        showCalmLink: true,
      };

    case "heavy":
      return {
        label: "Heavy Day",
        message: hasAssistant
          ? "Demanding schedule - you'll both need to stay on pace"
          : "Challenging day - prioritize breaks and self-care",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        emoji: "🔥",
        showCalmLink: true,
      };

    case "overloaded":
      return {
        label: "Overloaded",
        message: hasAssistant
          ? "Even with help, this schedule is intense - consider adjustments"
          : "This schedule is too heavy - let's find ways to lighten it",
        color: "bg-red-500",
        textColor: "text-red-600",
        emoji: "🚨",
        showCalmLink: true,
      };
  }
}

/**
 * Main function: Assess workload and return full assessment
 */
export function assessWorkload(input: WorkloadInput): WorkloadAssessment {
  // If we have completed appointments, calculate remaining workload
  const remainingCount = input.completedCount !== undefined
    ? input.appointmentCount - input.completedCount
    : input.appointmentCount;

  // Estimate remaining minutes (proportional)
  const remainingMinutes = input.completedCount !== undefined && input.appointmentCount > 0
    ? Math.round(input.totalMinutes * (remainingCount / input.appointmentCount))
    : input.totalMinutes;

  // Create adjusted input for remaining work
  const remainingInput: WorkloadInput = {
    ...input,
    appointmentCount: remainingCount,
    totalMinutes: remainingMinutes,
    // Large dogs should be proportionally adjusted too (rough estimate)
    largeDogCount: input.completedCount !== undefined && input.appointmentCount > 0
      ? Math.round(input.largeDogCount * (remainingCount / input.appointmentCount))
      : input.largeDogCount,
  };

  const level = determineWorkloadLevel(remainingInput);
  const display = getLevelDisplay(level, input.hasAssistant);
  const stressPoints = getStressPoints(remainingInput, level);
  const workloadScore = calculateWorkloadScore(remainingInput);

  return {
    level,
    label: display.label,
    message: display.message,
    color: display.color,
    textColor: display.textColor,
    emoji: display.emoji,
    showCalmLink: display.showCalmLink,
    stressPoints,
    workloadScore,
  };
}

/**
 * Convenience function: Assess from appointment list
 * Uses groomIntensity when available, falls back to weight-based estimation
 */
export function assessWorkloadFromAppointments(
  appointments: Array<{
    serviceMinutes: number;
    pet?: {
      weight?: number | null;
      groomIntensity?: GroomIntensity | null;
    } | null;
  }>,
  hasAssistant: boolean,
  completedCount?: number
): WorkloadAssessment {
  const LARGE_DOG_THRESHOLD = 50; // lbs (used as fallback if no intensity set)

  const totalMinutes = appointments.reduce((sum, apt) => sum + apt.serviceMinutes, 0);

  // Calculate "large dog equivalent" from intensity values
  // DEMANDING (3) and INTENSIVE (4) count as "large dog" equivalent for legacy calculation
  // This maintains backwards compatibility with the existing assessment logic
  const largeDogCount = appointments.filter(apt => {
    // If intensity is set, use it
    if (apt.pet?.groomIntensity) {
      return apt.pet.groomIntensity === "DEMANDING" || apt.pet.groomIntensity === "INTENSIVE";
    }
    // Fall back to weight-based check
    return apt.pet?.weight && apt.pet.weight > LARGE_DOG_THRESHOLD;
  }).length;

  return assessWorkload({
    appointmentCount: appointments.length,
    totalMinutes,
    largeDogCount,
    hasAssistant,
    completedCount,
  });
}
